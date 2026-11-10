/** FlashYun native file actions for pinned draw.io 32.6.9. Apache-2.0. */
(function()
{
    if (urlParams['flashyun'] !== '1' || urlParams['embed'] !== '1') return;

    App.initPluginCallback();
    App.embedModePluginsCount++;
    Draw.loadPlugin(function(ui)
    {
        var writable = urlParams['noSaveBtn'] !== '1';

        // The official embed patch action has no expected-base condition and
        // applies remote changes without an undo entry. Keep that transport and
        // native implementation, adding one closed host-only guarded variant.
        // The entire batch was compiled from this exact native XML snapshot;
        // comparing it synchronously here closes the export-to-dispatch race.
        var nativePatch = DrawioFile.prototype.patch;
        DrawioFile.prototype.patch = function(patches, resolver, undoable, sendChanges, mergeInserts)
        {
            var guard = patches != null && patches.length === 1 &&
                patches[0] != null ? patches[0]._flashyun : null;
            if (guard == null) return nativePatch.apply(this, arguments);
            if (guard.version !== 1) { guard.rejected = 'document_editor_unavailable'; return; }
            if (guard.probe === true) { guard.supported = true; return; }
            var graph = this.ui.editor.graph;
            if (!writable || !graph.isEnabled()) { guard.rejected = 'operation_not_allowed'; return; }
            graph.stopEditing();
            if (typeof guard.expectedXml !== 'string' || this.ui.getFileData(true) !== guard.expectedXml)
            {
                guard.rejected = 'revision_conflict';
                return;
            }
            var patch = patches[0];
            // No file/page insertion or removal and no raw engine dispatch.
            if (Object.keys(patch).some(function(key) { return key !== 'u' && key !== '_flashyun'; }) ||
                patch.u == null || typeof patch.u !== 'object')
            {
                guard.rejected = 'invalid_input';
                return;
            }
            if (guard.layout != null)
            {
                var layouts = {
                    verticalFlow: function() { return new mxHierarchicalLayout(graph, mxConstants.DIRECTION_NORTH); },
                    horizontalFlow: function() { return new mxHierarchicalLayout(graph, mxConstants.DIRECTION_WEST); },
                    verticalTree: function() { return new mxCompactTreeLayout(graph, false); },
                    horizontalTree: function() { return new mxCompactTreeLayout(graph, true); },
                    radialTree: function() { return new mxRadialTreeLayout(graph); },
                    organic: function() { return new mxFastOrganicLayout(graph); }
                };
                if (!Object.prototype.hasOwnProperty.call(layouts, guard.layout) ||
                    this.ui.currentPage == null || this.ui.currentPage.getId() !== guard.pageId)
                {
                    guard.rejected = 'document_conflict';
                    return;
                }
                graph.model.beginUpdate();
                try { layouts[guard.layout]().execute(graph.getDefaultParent()); }
                finally { graph.model.endUpdate(); }
            }
            else
            {
                nativePatch.call(this, [{u: patch.u}], null, true, true, mergeInserts);
            }
            guard.applied = true;
        };
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
