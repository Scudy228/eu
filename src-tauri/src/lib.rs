#[cfg(desktop)]
use tauri::{
	menu::{Menu, MenuItem},
	tray::TrayIconBuilder
};

#[tauri::command]
fn write_file_abs(path: String, data: Vec<u8>) -> Result<(), String> {
	let p = std::path::Path::new(&path);
	if let Some(parent) = p.parent() {
		std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
	}
	std::fs::write(p, &data).map_err(|e| e.to_string())
}

#[tauri::command]
fn remove_file_abs(path: String) -> Result<(), String> {
	let _ = std::fs::remove_file(&path);
	Ok(())
}

#[tauri::command]
fn get_documents_dir() -> String {
	if let Some(docs) = dirs::document_dir() {
		return docs.to_string_lossy().to_string();
	}
	if let Some(home) = dirs::home_dir() {
		return home.to_string_lossy().to_string();
	}
	String::new()
}

#[tauri::command]
fn get_exe_dir() -> String {
	let exe = match std::env::current_exe() {
		Ok(p) => p,
		Err(_) => return String::new(),
	};
	let dir = match exe.parent() {
		Some(d) => d.to_path_buf(),
		None => return String::new(),
	};
	#[cfg(target_os = "macos")]
	{
		let s = dir.to_string_lossy();
		if s.ends_with("Contents/MacOS") {
			if let Some(p) = dir.parent().and_then(|d| d.parent()) {
				return p.to_string_lossy().to_string();
			}
		}
	}
	dir.to_string_lossy().to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
	tauri::Builder::default()
		.setup(|_app| {
			#[cfg(desktop)]
			{
				let quit_i = MenuItem::with_id(_app, "quit", "Quitter", true, None::<&str>)?;
				let menu = Menu::with_items(_app, &[&quit_i])?;
				let _tray = TrayIconBuilder::new()
					.menu(&menu)
					.show_menu_on_left_click(true)
					.icon(_app.default_window_icon().unwrap().clone())
					.on_menu_event(|app, event| match event.id.as_ref() {
						"quit" => { app.exit(0); }
						_ => {}
					})
					.build(_app)?;
			}
			Ok(())
		})
		.plugin(tauri_plugin_http::init())
		.plugin(tauri_plugin_shell::init())
		.plugin(tauri_plugin_notification::init())
		.plugin(tauri_plugin_os::init())
		.plugin(tauri_plugin_fs::init())
		.plugin(tauri_plugin_store::Builder::new().build())
		.plugin(tauri_plugin_sql::Builder::default().build())
		.invoke_handler(tauri::generate_handler![get_exe_dir, get_documents_dir, write_file_abs, remove_file_abs])
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
