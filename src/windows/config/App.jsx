import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { get, set, writeConfig } from '../../global/config'
import { Button, TextField, Select, MenuItem } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { notification, app } from '@tauri-apps/api'
import { nanoid } from 'nanoid'
import ConfigList from './components/ConfigList'
import ConfigItem from './components/ConfigItem'
import language from '../../global/language'
import * as interfaces from '../../interfaces'
import { light, dark } from '../themes';
import './style.css'

export default function App() {
  const [version, setVersion] = useState();
  const [tauriVersion, setTauriVersion] = useState();
  const [shortcutTranslate, setShortcutTranslate] = useState(get('shortcut_translate', ''));
  const [shortcutPersistent, setShortcutPersistent] = useState(get('shortcut_persistent', ''));
  const [targetLanguage, setTargetLanguage] = useState(get('target_language', 'zh'));
  const [_interface, setInterface] = useState(get('interface', 'youdao_free'));
  const [theme, setTheme] = useState(get('theme', 'light'));
  const [interfaceConfigs, setInterfaceConfigs] = useState([]);

  useEffect(() => {
    let interface_configs = [];
    Object.keys(interfaces).map(
      i => {
        const needs = interfaces[i]['info']['needs'];
        Object.keys(needs).map(
          n => {
            interface_configs.push({
              'interface_name': i,
              'interface_name_zh': interfaces[i]['info']['name'],
              'needs_name': n,
              'needs_name_zh': needs[n],
              'needs_value': get(n, '')
            })
          }
        )
      }
    )
    setInterfaceConfigs(interface_configs)
    app.getVersion().then(v => { setVersion(v) })
    app.getTauriVersion().then(v => { setTauriVersion(v) })
  }, [])


  function saveConfig() {
    set('shortcut_translate', shortcutTranslate);
    set('shortcut_persistent', shortcutPersistent);
    set('target_language', targetLanguage);
    set('theme', theme);
    set('interface', _interface);
    interfaceConfigs.map(
      x => {
        set(x['needs_name'], x['needs_value'])
      }
    )

    writeConfig().then(
      _ => {
        notification.sendNotification({
          title: '??????????????????',
          body: '??????????????????????????????????????????'
        })
        e => {
          notification.sendNotification({
            title: '??????????????????',
            body: `??????????????????:${e}`,
          })
        }
      }
    )

  }

  function checkUpdate() {
    axios.get('https://api.github.com/repos/Pylogmon/pot/releases/latest').then(
      res => {
        let remoteVersion = res.data['tag_name'];
        if (remoteVersion == version) {
          notification.sendNotification({
            title: '????????????????????????'
          })
        } else {
          notification.sendNotification({
            title: '???????????????',
            body: `??????????????????${remoteVersion}`,
          })
        }
      },
      err => {
        notification.sendNotification({
          title: '??????????????????????????????',
          body: `${err}`
        })
      }
    )
  }
  return (
    <ThemeProvider theme={theme == 'light' ? light : dark}>
      <CssBaseline />
      <div className='content'>
        <ConfigList label="?????????">
          <ConfigItem label="????????????">
            <TextField
              fullWidth
              value={shortcutTranslate}
              onChange={(e) => { setShortcutTranslate(e.target.value) }}
            />
          </ConfigItem>
          <ConfigItem label="??????????????????">
            <TextField
              fullWidth
              value={shortcutPersistent}
              onChange={(e) => { setShortcutPersistent(e.target.value) }}
            />
          </ConfigItem>
        </ConfigList>
        <ConfigList label="????????????">
          <ConfigItem label="????????????">
            <Select
              fullWidth
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
            >
              {
                language.map(x => {
                  return <MenuItem value={x.value} key={nanoid()}>{x.label}</MenuItem>
                })
              }
            </Select>
          </ConfigItem>
          <ConfigItem label="????????????">
            <Select
              fullWidth
              value={_interface}
              onChange={(e) => setInterface(e.target.value)}
            >
              {
                Object.keys(interfaces).map(
                  x => {
                    return <MenuItem value={x} key={nanoid()}>{interfaces[x]['info']['name']}</MenuItem>
                  }
                )
              }
            </Select>
          </ConfigItem>
          <ConfigItem label="????????????">
            <Select
              fullWidth
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <MenuItem value='light'>??????</MenuItem>
              <MenuItem value='dark'>??????</MenuItem>
            </Select>
          </ConfigItem>
        </ConfigList>
        <ConfigList label="????????????">
          {
            interfaceConfigs.map(
              x => {
                return <ConfigItem label={`${x['interface_name_zh']} ${x['needs_name_zh']}`}>
                  <TextField
                    fullWidth
                    defaultValue={x['needs_value']}
                    onChange={(e) => {
                      let configs = interfaceConfigs;
                      for (let i in configs) {
                        if (configs[i]['needs_name'] == x['needs_name']) {
                          configs[i]['needs_value'] = e.target.value
                          break;
                        }
                      }
                      setInterfaceConfigs(configs)
                    }}
                  />
                </ConfigItem>
              }
            )
          }
        </ConfigList>
        <ConfigList label="????????????">
          <ConfigItem label="????????????">
            {`pot: ${version} tauri:${tauriVersion}   `}
            <Button onClick={checkUpdate}>????????????</Button>
            <a href='https://github.com/Pylogmon/pot/releases' target="_blank"><Button>????????????</Button></a>
          </ConfigItem>
        </ConfigList>
      </div>
      <div className='foot'>
        <Button
          variant='contained'
          size='large'
          onClick={saveConfig}
        >
          ????????????
        </Button>
      </div>
    </ThemeProvider>
  )
}

