import { useState, useEffect } from "react";
import {
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from "@mui/material";
import { DarkMode, LightMode, SettingsBrightness } from "@mui/icons-material";

export default function UxModoMenu({
    value,
    onChange
}: {
    value: 'LIGHT' | 'DARK' | 'SYSTEM' | null;
    onChange: (modo: 'LIGHT' | 'DARK' | 'SYSTEM') => void;
}) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [modoActual, setModoActual] = useState<'LIGHT' | 'DARK' | 'SYSTEM'>(value ?? 'LIGHT');

    useEffect(() => {
        // Si el valor del padre cambia, actualizamos nuestro estado interno
        setModoActual(value ?? 'LIGHT');
    }, [value]);

    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = (modo: 'LIGHT' | 'DARK' | 'SYSTEM') => {
        setModoActual(modo); // actualizar estado interno
        onChange(modo); // notificar al padre
        handleClose();

        // Eliminar cualquier estilo previo
        const darkModeStyle = document.getElementById('dark-mode-toggle');
        if (darkModeStyle) darkModeStyle.remove();

        if (modo === 'DARK') {
            const drkMo = document.createElement('style');
            drkMo.id = 'dark-mode-toggle';
            drkMo.innerText = `
html {color-scheme:dark!important;color:#000}
html * {color-scheme:light!important;text-shadow:0 0 .1px}
html body {background:none!important}
html, html :is(i, img, image, embed, video, canvas, option, object, :fullscreen:not(iframe), iframe:not(:fullscreen)),
html body>* [style*="url("]:not([style*="cursor:"]):not([type="text"]) {filter:invert(1)hue-rotate(180deg)!important}
html body>* [style*="url("]:not([style*="cursor:"]) :not(#a),
html:not(#a) :is(canvas, option, object) :is(i, img, image, embed, video),
html:not(#a) video:fullscreen{filter:unset!important}`;
            document.head.appendChild(drkMo);
        } else if (modo === 'SYSTEM') {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                const drkMo = document.createElement('style');
                drkMo.id = 'dark-mode-toggle';
                drkMo.innerText = `
html, body { background-color: #f8f9fa !important; color: #212529 !important; }
html * { text-shadow: 0 0 .05px #6c757d; }
button, input, select, textarea { background-color: #e9ecef !important; color: #212529 !important; border-color: #ced4da !important; box-shadow: none !important;}
img, video, canvas, object { filter: none !important;}
html :fullscreen, html :fullscreen * { filter: unset !important;}`;
                document.head.appendChild(drkMo);
            }
        }
    };

    const icon =
        modoActual === 'DARK'
            ? <DarkMode />
            : modoActual === 'LIGHT'
                ? <LightMode />
                : <SettingsBrightness />;

    return (
        <>
            <IconButton
                id="uxmodo-button"
                aria-controls={open ? "uxmodo-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
            >
                {icon}
            </IconButton>

            <Menu
                id="uxmodo-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    list: {
                        "aria-labelledby": "uxmodo-button",
                    },
                }}
            >
                <MenuItem onClick={() => handleSelect("LIGHT")}>
                    <ListItemIcon><LightMode /></ListItemIcon>
                    <ListItemText primary="Modo Claro" />
                </MenuItem>

                <MenuItem onClick={() => handleSelect("DARK")}>
                    <ListItemIcon><DarkMode /></ListItemIcon>
                    <ListItemText primary="Modo Oscuro" />
                </MenuItem>

                <MenuItem onClick={() => handleSelect("SYSTEM")}>
                    <ListItemIcon><SettingsBrightness /></ListItemIcon>
                    <ListItemText primary="Modo Sistema" />
                </MenuItem>
            </Menu>
        </>
    );
}
