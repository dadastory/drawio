/** FlashYun native file actions for pinned draw.io 32.6.9. Apache-2.0. */
(function()
{
    if (urlParams['flashyun'] !== '1' || urlParams['embed'] !== '1') return;

    App.initPluginCallback();
    App.embedModePluginsCount++;
    Draw.loadPlugin(function(ui)
    {
        var writable = urlParams['noSaveBtn'] !== '1';
        var chinese = (mxClient.language || '').indexOf('zh') === 0;
        mxResources.parse('flashyunDownload=' + (chinese ? '下载' : 'Download') + '\n' +
            'flashyunExportAs=' + (chinese ? '导出为' : 'Export As'));

        function requestHost(name)
        {
            ui.editor.graph.stopEditing();
            ui.remoteInvoke(name, [], null, function() {}, function()
            {
                ui.handleError({message: mxResources.get('errorSavingFile')});
            });
        }

        var exportAs = ui.actions.addAction('flashyunExportAs', function()
        {
            if (writable) requestHost('flashyunExportAs');
        });
        exportAs.shortcut = Editor.ctrlKey + '+' + Editor.shiftKey + '+S';
        ui.keyHandler.bindAction(83, true, 'flashyunExportAs', true);
        ui.actions.addAction('flashyunDownload', function()
        {
            // The embed link interceptor cancels local anchors, including blob downloads.
            // The host uses the official export protocol and its own download adapter.
            requestHost('flashyunDownload');
        });

        // Keep native menu primitives and useful offline actions, with a single export entry.
        ui.menus.get('file').funct = function(menu, parent)
        {
            ui.menus.addMenuItems(menu, writable ?
                ['save', 'flashyunExportAs', 'flashyunDownload', '-'] :
                ['flashyunDownload', '-'], parent);
            ui.menus.addSubmenu('importFrom', menu, parent);
            ui.menus.addSubmenu('embed', menu, parent);
            if (urlParams['libraries'] === '1')
            {
                ui.menus.addMenuItems(menu, ['-'], parent);
                ui.menus.addSubmenu('newLibrary', menu, parent);
                ui.menus.addSubmenu('openLibraryFrom', menu, parent);
            }
            ui.menus.addMenuItems(menu, ['-', 'pageSetup', 'print'], parent);
        };
    });
})();
