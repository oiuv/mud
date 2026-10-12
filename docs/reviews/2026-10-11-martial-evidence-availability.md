# 武学采集证据可用性盘点（2026-10-11）

## 结论与范围

维护者于2026-10-12确认未做过临时目录清理。下列缺失原因仍未知，不归因于人为清理，也不据此重写历史结果。现存完整原件继续保全到仓库外的持久证据目录，新采集单独建系列，不覆盖旧报告或补造缺失链条。

本次固定盘点了 138 份 `docs/reviews/*results.md` 当时明确引用的 344 个唯一 `mud-martial-data-*` 系列目录。目录范围同时包括正式、烟雾、失败、中止和超时记录，不等于 344 批成功采集。

344 个系列全部完成默认沙箱视图与 `require_escalated` 宿主权限下的逐路径复核；根目录、元数据、样本文件数量及已枚举 attempt 的结果逐字段一致。宿主系列复核时点为北京时间 **2026-10-11 21:26:57–21:27:14**；同一清单中的 143 个实际报告目录于 **21:28:36** 完成宿主复核，与默认视图一致。

| 当前状态 | 系列数 | 本次能确认的边界 |
|---|---:|---|
| 元数据与原始事件在，样本文件数量等于清单计划量 | 77 | 数量齐全；未重新校验样本内容、指纹或统计结果 |
| 元数据与原始事件在，原报告已记录失败或中止 | 8 | 保留失败证据；不得作为成功采集或本次证据缺失处理 |
| 根元数据与样本/事件链条不完整 | 259 | 当前引用位置无法复核原采集；原因未知，不能断言永久丢失 |
| 合计 | 344 | 没有重新运行采集或将缺失系列转成通过 |

85 个元数据尚在的系列均有对应 `result.json`、`process.json` 和原 `events.jsonl`。其中 77 个“数量齐全”也不自动等于原语义校验通过。

259 个不可复核系列中，258 个根目录仍在，1 个根目录未找到；39 个 `samples` 目录存在但无 JSON 样本文件，220 个未找到 `samples` 目录。已枚举的 274 个 attempt 均未找到结果、进程记录及原事件文件；这 274 是 attempt 数，不能与 259 个系列重复相加。全清单共检查既有 359 个 attempt，没有再遍历新的 attempt 或无关 Temp 目录。

报告目录共 143 个：42 个存在 JSON/Markdown 对，20 个目录存在但未见顶层报告文件，81 个引用位置未找到。没有出现拒绝访问或其他非路径不存在的读取错误；现存 85 份系列元数据均以 UTF-8 正常解析。

## 方法与证据边界

本次共同的路径前缀记为：

```text
P = C:/Users/oiuv/AppData/Local/Temp
```

只从上述结果文档提取已引用的精确目录并去重。先以最新完整系列 `8mCjPr/attempt-r2XRxI` 核对实际布局，再检查同一布局中的必要文件：

- 根元数据：`P/mud-martial-data-<series>/series.json`，读取其中 `identity.conditions` 的条件数和计划样本量。
- 样本账本：系列根的 `samples/*.json`，只计文件名及数量，不把目录存在当作内容齐全。
- 原始事件：`runs/attempt-<attempt>/mudlib/log/events.jsonl`，不只查 attempt 顶层。
- attempt 结果：`runs/attempt-<attempt>/result.json` 与 `process.json`。
- 报告：结果文档明确引用目录中的顶层 JSON/Markdown 文件名。

布局依据为 [ledger.mjs](../../tools/tests/martial_data/ledger.mjs) 的系列与样本账本路径，以及 [execution.mjs](../../tools/tests/martial_data/execution.mjs) 的 attempt 原事件与结果路径。参考系列根确有 `series.json`、`inventory.json`、`catalog.json`、`coverage.json`、`summary.md`、`samples`、`findings`、`runs`；其 3298 个样本 JSON 与计划量相等，原事件位于 attempt 的 `mudlib/log`。

默认视图的“不存在”没有直接当作宿主结论：之后通过两批显式路径清单，在 `require_escalated` 下重新 stat 根目录、元数据、samples 和各已登记 attempt 的三个文件；完整结果与默认视图一致。报告也按同一 143 个精确路径提权复核。本次没有全局扫描系统 Temp、猜测其他备份位置、访问玩家数据，也没有复制、删除、恢复或重采。

本次只确认可用性与文件数量，不重新读取全部样本/事件正文，不重新计算数值或哈希，不以永久汇总文档替代原始证据。旧报告仍代表当时记录的执行与结论，本文不删改它们；当前缺少原件的系列不得表述为“已按原始数据重新验收”。是否有其他保全副本须另行确认，未恢复前状态保持不可复核，不推断原因。

## 可优先保全的 85 个现存系列

下面均以 `mud-martial-data-` 为前缀，附录中的大小写保持原目录名。77 个样本文件数量齐全的系列：

```text
0dr80P 0u3AHU 0ZMNYj 1PPp3g 379cLh 4F9cQd 507EpM 5j7Jh6
5ywpVp 7fG7UO 7qqezJ 8mCjPr 9Vx3OA a24tEc amZEId Aqdtst
bepfmb bQerCM cQVgIq eHuynQ eXWHrF fKX2Q0 fuu69I FvcS9B
GGEYCu gGytYF gUDvTe h2NQll h9ciU3 HcUKDo hDsq0N HLopRA
IblnYt iCMhz6 ihMEQH jaoixr JTMeNn Jud1Na K2xwAi KAYNPe
KdltF6 khYQFz L33fNH mhSA2d Miy70o mP2Nbk Mq0WTp mXXBmU
OiU7rf pE4zlF Q08h6m qD6Dsm QN8jVr QR7TjV qx1FE8 RBCn5P
rc84qW rD2L3B RQ9yqn rWjZj9 T7N081 TN2PnH TNvIhK uQJybD
uSSPgM UZtfte VEpVw9 vjQg1s VnoJlE VT5Azf WedvdV wlgmIq
x3Zs30 y5hdXa y8YyBt Z4b3P4 zkQ8E5
```

另有 8 个保留失败/中止原始证据的系列。原因列沿用对应历史报告，不是本次重新执行所得；“未建目录”不等于没有原事件。

| 系列 / attempt | 当前样本 JSON / 计划量 | 原记录性质与报告 |
|---|---:|---|
| cUCFk6 / Md2fIV | 60 / 70 | 运功观察器/记录校验失败；[原报告](2026-10-10-school-emei-exert-results.md) |
| GsmdV6 / Leldt1 | 88 / 161 | 死亡资源期望不匹配；[原报告](2026-10-11-school-emei-jiuyin-results.md) |
| gw8Xuv / YhmEiC | 未建目录 / 142 | 装备初始闪避 apply 偏移未计入；[原报告](2026-10-11-school-gumu-control-results.md) |
| HQNAj1 / u7QuMc | 10 / 82 | 九阴增益字段白名单不完整；[原报告](2026-10-11-school-emei-jiuyin-buff-results.md) |
| J57009 / hZTSkq | 未建目录 / 153 | 恢复采集器将性别空值视为不匹配；[原报告](2026-10-10-school-emei-recovery-results.md) |
| KP0Bwi / ToM09M | 635 / 2220 | 既有 query_con 条件输入未达目标；[原报告](2026-10-11-school-emei-jiuyin-results.md) |
| lAZ6iG / HloULY | 未建目录 / 316 | 忙乱空值校验不匹配；[原报告](2026-10-10-school-emei-cultivation-results.md) |
| VC9qtL / 37OepT | 51 / 82 | guiyuan right 原参数校验不匹配；[原报告](2026-10-11-school-emei-jiuyin-buff-results.md) |

## 259 个当前不可复核系列

表中只写目录后缀，以免重复长路径。每一行均未找到根 `series.json`；每个列出的 attempt 也均未找到以下三件原文件：

```text
P/mud-martial-data-<系列>/runs/attempt-<attempt>/result.json
P/mud-martial-data-<系列>/runs/attempt-<attempt>/process.json
P/mud-martial-data-<系列>/runs/attempt-<attempt>/mudlib/log/events.jsonl
```

例如，桃花岛历史引用 `Llkk2C/dG5RVN` 与九阴历史引用 `jxdG9I/rWmRgC` 的根元数据和原事件均经宿主读取确认未找到，两个根目录仅余 `runs`；参见 [桃花岛教学原报告](2026-10-08-teaching-taohua-results.md) 与 [九阴秘籍原报告](2026-10-08-teaching-jiuyin-results.md)。较后的峨嵋兵器系列 `6d2Imq/JrVgO1` 也缺根元数据与原事件，其 samples 目录没有样本 JSON，不能将空目录当作保存完好的证据。

唯一整根未找到的 `8XBDcd` 在 [少林晋升原报告](2026-10-10-teaching-shaolin-promotion-results.md) 中属于版本查询超时记录，并非已完成正式采集；它没有可枚举 attempt，下表以“—”表示，不编造原事件路径。

| 系列后缀 | attempt 后缀（多个以逗号分隔） |
|---|---|
| 0abUcJ | 5tCMP3 |
| 0cBbLa | 7KlDRS |
| 0iBPnu | xMGrEL |
| 0XUrch | bt1Aoz |
| 12svgj | kaeRNq |
| 18YRxx | eRuUJz |
| 1aHks5 | Bsigsj |
| 1eMUlD | RaVm2E |
| 25vB1j | cbPqHE |
| 2EbBeQ | u4uvgB |
| 2YYHjk | FfEvrd |
| 34OSqn | KAyPW1 |
| 3JU5gG | KOZ51P |
| 3kAW97 | HGz0hv |
| 3QVnRc | uFJM6a |
| 3T9PkJ | qZa1kG |
| 3wERMb | jE47oA |
| 3WPMyb | M8VOCG |
| 3xwLuc | CP136c |
| 3ZwiVi | XkvT89 |
| 48jmIz | n7lzIl |
| 4hbGB7 | r7ZT23 |
| 4U4Sfq | 89AqcE, BY3w3Z, ESzWk7, n2TSH7, q4LwH3 |
| 4ztJ9Y | AWe1ko |
| 5aOc90 | RYvmwc |
| 5el1Lj | FKuv17 |
| 5jhs55 | iAjOvu |
| 5XINXV | lOahkg |
| 68o4aa | go5FpG |
| 6d2Imq | JrVgO1 |
| 7NXSSy | JcK9MZ |
| 7ov3ZM | tAeRZY |
| 8Bi55U | kBA9t9 |
| 8Fp5Do | xTHK6w |
| 8ielil | pt4d4y |
| 8Rksmp | WkXGI9 |
| 8WcGpQ | B2P2zu |
| 8WmkFk | QFoiHn |
| 8XBDcd | —（根目录未找到） |
| 99QwBW | Hj3J82 |
| 9OnxOH | U0589U |
| 9QrTwq | zUgt04 |
| a3Lrq3 | pCmSQg |
| A3potb | odjlM6 |
| ABTcjS | CdGUkJ, wUy4fZ |
| Au78Ad | Tnn0nw |
| AuFTuL | BK2kXj |
| BEeyyl | Biy5VS |
| BEPq24 | TvTPQM |
| bgZITa | iB6f02 |
| bMzP9e | Dw6pZS |
| BobV89 | 0xaSWY |
| bpebAc | WRmPTX |
| BPgAfr | I7f4eV |
| btsiiO | WceB0I |
| BVgLTe | 4cipVe |
| bWsS7m | ZLrAyZ |
| BYyyM4 | OUqRVh |
| BZCqRn | X7w8ee |
| BZsoE3 | S7rDgQ |
| C31PpP | 9zHfSz |
| c67Kgu | laNo6A |
| Ccw7uX | WZFpbu |
| ciePgG | R3LJb8 |
| ciYn73 | 1RVL31 |
| cl9L0T | vBpASU |
| CS71ZU | BIVmwy |
| csfPgO | twOfZo |
| cTVpjT | MhsEpU |
| czEFMQ | cil8n1 |
| d3NGUa | ygMWdu |
| dctCWV | u4clci |
| dG97M1 | cIjA4T |
| dI82L7 | taDy2K |
| E4CQXj | bAOJEk |
| E8wnJY | 2FhcrS |
| EhARBk | AE1KOK |
| eLIRVE | BpidxN |
| eO6vni | kgoVdv |
| FE3usA | nIimQB |
| ffi3EA | o8M0N0 |
| fkq3BL | XKL1Sd |
| FL19tB | 8tHwr7 |
| Fougbn | NwAA39 |
| fqOLHP | c2Nu4r |
| FUIK3F | i3EFOJ |
| G0me37 | E3M8xh |
| G4Zt9T | PwocZR |
| g5lIT3 | QAWRTX |
| gb97XR | 5kw50f |
| gc5zXm | 41YbIx |
| gG49Ya | P0V6LS |
| Glwxvr | 8eM6FG |
| gNSNCi | L5Tudf |
| GopXUx | LjETdN |
| GUyH5r | XlP9At |
| H15jeN | urK6Z7 |
| H1bSzO | K3xYrw |
| HA8FNX | jaNnwe |
| hCPE2k | PKXrT5 |
| HhkLVa | 1MBrXe |
| HiPlV9 | G3aoYI |
| HmMwaz | U438dv |
| HOPpvE | wx4XMg |
| hsFktZ | 5Kec7E, 6h9CMS, FMznGi, i1yD3x, Q65aYy, XBkFYl |
| I1fVjA | 6zrnqs |
| I6iT9U | nFkWKW |
| i6xC5M | YCmLZy |
| Id6ldD | fRICyz |
| IDq40C | Sxnf60 |
| iMf3UO | ylkgwh |
| INMVNj | WXTNt6 |
| iqGhPK | B4nIST |
| JIAGJh | zweaj8 |
| JKc5YW | Dwcsz1 |
| JLBlld | jWBnt3 |
| JMhvxy | UEJhlE |
| jOd0pw | uulHrf |
| JVHHxk | jdUjMv |
| jxdG9I | rWmRgC |
| JYm9LP | 2RykFf |
| kCaLW2 | qPMDmm, yjbjsl, Z0BuRp |
| KDNTqW | GUnQKi |
| kfVYzZ | C7eKLz |
| kNlhCF | Ujlm2V |
| KoOFXg | G0VqmN |
| kpPgNv | pxtaAj |
| KQ3Ptq | ju938J |
| kt7w3d | 1cGLTn |
| l7JDtb | i3CHYE |
| LFQYvO | sncmRj |
| lJuF9f | 2CQ6fR |
| lJz9jm | JdKm4J |
| Ll8zat | CHBOfb |
| Llkk2C | dG5RVN |
| LnD4Aq | rElzjG |
| lOLua3 | QWXBqf |
| LQYAmg | 3sRTqD |
| M57rm7 | l0sS6N |
| M9qsjs | D5I1RD, RmIIPO |
| mFT5PX | NMQRrY |
| mnYaj7 | 4bI2OO |
| MwacOb | zVyWRy |
| n3Vb0W | rgaLHF |
| N4qKzZ | ANmXEl |
| NbkjUu | M7D8Cr |
| NFDRf5 | 7LziuC |
| Nr2vUJ | 3JCUev |
| nRITc9 | uol4zE |
| NxlDAs | 7LBZ1r |
| OJfD9l | rhDoos |
| OJmPTw | TaSaDO |
| OkXgwf | Fzkd4q |
| oMKgZ5 | Um2g5u |
| oNjoJY | 7gUWYl |
| OPjlQw | gGxR7z |
| OPmFGP | aKLs3B |
| opUIzY | pO7wpQ |
| Os7CnG | Jco5rj |
| OSy8mb | ecBV7v |
| OUjwRP | LCP8t4 |
| p9EUog | nlYa4a |
| PFMzQD | PE956f |
| plXWyS | cYj2Jt |
| pNqzu8 | 8iVWcf |
| pQ4h3s | m9QwEH |
| PuUEjW | 4L1XBi |
| Pyrswi | XSpQJg |
| pZUj6k | gQ0ywe |
| Q0u85o | atbjaY |
| qHP3dK | NYLeOM |
| qMbpaz | 9YGJlH |
| QQMEc4 | 0T0mkE |
| qV37Z6 | 703yMy |
| Qw0m5K | 4N7ZZA |
| Qx5CZl | KMxedd |
| qyc5Jx | uhm2uU |
| rfRX9X | duP08o |
| RJTW4Q | IImv2J |
| rMUpfU | hbOLNZ |
| rnTVQI | rPdb5V |
| rRYg0D | CSJ3Ij, i2mwph, iuG8tX, xVOiEQ |
| ryOfNt | 0JDe3n |
| rzy29H | CiapFg |
| s00vVS | GtdH9k |
| s5DzWM | 2Sts92 |
| sai7eb | fXLbRZ |
| sce0sb | wyxS0f |
| Sd1uGr | JyPkjo |
| shLsM7 | kQnEbC |
| sISNQW | LKgrfW |
| slk82L | qxvgOs |
| tE02z5 | BudvNI |
| TfKnBV | 3Nq4oB |
| Tl83g1 | himOFT |
| tNCmKi | CIhcG9 |
| ToCQIs | fui2bt |
| tqbHDy | ZT5Be3 |
| Tv65rn | eX2Omq |
| tXro2X | KRD6xP |
| U1ohys | b8UWWG |
| u1Oo0k | 121vP9 |
| u6gWWS | uDoqMw |
| u9LBlZ | GtCoKg |
| Uc3yQF | iMMjfg |
| uFEzx3 | opNnPF |
| UIO18z | DNX0Ek |
| Un7kBO | I1N2Fk |
| uOHaHT | Z852ls |
| UrtxpJ | sA86zV |
| uT52J9 | rh5Cy5 |
| UvEL8M | r5YQvt |
| Uw83Gj | Fld9nd |
| UyQIvg | khbw5g |
| UZbA8S | qav0Q8 |
| vDljKd | 0tjnQu |
| vEYlUD | sEqn4m |
| VMQqCd | ALqi4z |
| vP1AYK | mBb40s |
| vPl7Xk | 63JSwP |
| vpOQzx | T8aT8V |
| vPRtoB | HttDX3 |
| vv4B3P | eNS0Ob |
| VXfzyF | DTSfmP |
| vxylKt | r7lNPz |
| w5GGOs | qD4uJR |
| W7WRQx | SAuMzR |
| wbD5PK | eqx0Rz |
| wcCaKr | G7PsRB |
| whmY0h | UXlsXz |
| WLLC3p | V99qhs |
| WlqxmO | jWLASy |
| WnOqK9 | t95SL6 |
| woKeHd | QRSPmz |
| wzA8os | gc41pO |
| x1W4tZ | H5PUha |
| X5P8kh | NU8OFx |
| x8ubcj | ICpDvu |
| xBw9zT | zfM2Rx |
| xcqngQ | r1JhvQ |
| xfEiUa | q0bxnF |
| xGx8FH | hmZCOZ |
| xQfsak | UwPvkM |
| xvXRpL | NNx926 |
| Y2t4qF | 4P9KyI |
| y7kA5w | DDRL0P |
| ydKxp9 | XztKlU |
| YivhZU | uKyXqj |
| YLLcXl | aCRG5c |
| YpOQTO | TxUeIU |
| yU1hZu | YxZOLG |
| YX4rTN | 1jGCpj |
| z1aT85 | 9l3aHv |
| Z2wcq8 | A1LlaF |
| zw6fQ8 | TMsFSS |
| ZWB0gg | DTZZgs |
| zwmwvS | 3VwsVF |
| zYydSq | EEGXFe |
| zZ689g | 6UxCF7 |

## 报告文件详单

初次提取获得 150 个候选名称，排除 5 个文档中的重跑示例目录（`mud-emei-bout-recheck`、`mud-emei-unarmed-recheck`、`mud-emei-weapons-recheck`、`mud-shaolin-bout-recheck`、`mud-wudang-bout-recheck`）和 2 个旧测试夹具根目录（`mud-weapon-balance-9ujXAI`、`mud-weapon-balance-DFGfAn`），后两者不是报告输出。剩余 143 个报告引用逐目录去重，均相对于前述 P。

### 42 个存在报告文件的目录

其中 37 个含 `school-combat.json` / `school-combat.md`；`mud-emei-miejue`、`mud-emei-recruitment`、`mud-emei-special`、`mud-emei-teachers`、`mud-emei-tonsure` 对应的 5 个目录含 `teaching.json` / `teaching.md`。这里确认的是文件存在，不代替内容或来源核验。

```text
mud-emei-bout-final-20261011
mud-emei-combination-final-20261010
mud-emei-cultivation-final-20261010
mud-emei-defense-final-20261010
mud-emei-exert-final-20261010
mud-emei-jiuyin-buff-final-20261011
mud-emei-jiuyin-final-20261011
mud-emei-jiuyin-learning-final-20261011
mud-emei-jiuyin-passive-final-20261011
mud-emei-learning-final-20261010
mud-emei-miejue-final-20261011
mud-emei-npc-final-20261011
mud-emei-public-force-final-20261010
mud-emei-recovery-final-20261010
mud-emei-recruitment-final-20261010
mud-emei-shexing-final-20261011
mud-emei-special-final-20261011
mud-emei-support-final-20261010
mud-emei-teachers-final-20261010
mud-emei-tonsure-final-20261011
mud-emei-unarmed-final-20261010
mud-emei-unarmed-final-v2-20261010
mud-emei-yijin-final-20261011
mud-emei-zhao-final-20261010
mud-gumu-advanced-final-20261011
mud-gumu-combination-final-20261011
mud-gumu-combo-final-20261011
mud-gumu-control-final-20261011
mud-gumu-cultivation-final-20261011
mud-gumu-defense-current-20261011
mud-gumu-direct-final-20261011
mud-gumu-exert-final-20261011
mud-gumu-fireice-final-20261011
mud-gumu-hubo-final-20261011
mud-gumu-movement-final-20261011
mud-gumu-needle-lifecycle-final-20261011
mud-gumu-poison-final-20261011
mud-gumu-recovery-final-20261011
mud-gumu-throwing-final-20261011
mud-gumu-unarmed-attack-final-20261011
mud-gumu-unarmed-final-20261011
mud-gumu-weapons-final-20261011
```

### 20 个目录存在但未见顶层报告文件

仅检查顶层 JSON/Markdown；不将“没有报告文件”写成“整个目录为空”，也不推断其子目录内容。

```text
mud-emei-weapons-final-20261010
mud-fumo-failure-final-20261010
mud-fumo-failure-smoke-20261010
mud-fumo-gifts-final-20261010
mud-fumo-gifts-smoke-pass-20261010
mud-fumo-special-final-20261010
mud-fumo-special-smoke-20261010
mud-shaolin-bout-final-20261010
mud-shaolin-challenge-failure-final-20261010
mud-shaolin-challenge-final-20261010
mud-shaolin-formation-gates-20261010
mud-shaolin-formation-xuanku-wait-20261010
mud-shaolin-formation-xuannan-wait-20261010
mud-shaolin-fumo-final-20261010
mud-shaolin-luohan-learning-20261010
mud-shaolin-promotion-20261010-final
mud-shaolin-recruitment-20261010
mud-shaolin-teachers-learning-20261010
mud-shaolin-tonsure-20261010
mud-shaolin-tonsure-formation-reader-20261010
```

### 81 个引用报告位置未找到

```text
mud-bout-final-20261008
mud-school-huashan-additional-20261009-final
mud-school-huashan-advanced-20261009
mud-school-huashan-combat-20261009-final
mud-school-huashan-defense-20261009
mud-school-huashan-duration-20261009
mud-school-huashan-learning-20261009
mud-school-huashan-upgrade-20261009
mud-school-quanzhen-advanced-20261009
mud-school-quanzhen-auxiliary-20261009
mud-school-quanzhen-basic-20261009
mud-school-quanzhen-cultivation-20261009
mud-school-quanzhen-defense-20261009
mud-school-quanzhen-practice-20261009
mud-school-quanzhen-recovery-20261009
mud-school-quanzhen-study-20261009-v2
mud-school-quanzhen-sword-20261009
mud-school-team-20261009
mud-school-wudang-combination-20261009
mud-school-wudang-core-20261009
mud-school-wudang-cultivation-20261009
mud-school-wudang-defense-20261009
mud-school-wudang-learning-20261009
mud-school-wudang-passive-20261009
mud-school-wudang-recovery-20261009
mud-school-wudang-shenmen-20261009
mud-school-wudang-study-20261009
mud-school-wudang-sword-20261009
mud-school-wudang-unarmed-20261009
mud-shaolin-additional-final-20261010
mud-shaolin-backlash-20261010-final
mud-shaolin-combination-20261010
mud-shaolin-cultivation-20261010
mud-shaolin-defense-20261010
mud-shaolin-exert-20261010
mud-shaolin-fingers-final-20261010
mud-shaolin-fists-final-20261010
mud-shaolin-hands-final-20261010
mud-shaolin-learning-final-v2-20261010
mud-shaolin-palms-final-20261010
mud-shaolin-public-force-20261010
mud-shaolin-recovery-20261010
mud-shaolin-support-20261010
mud-shaolin-sword-final-20261010
mud-shaolin-unarmed-learning-final-20261010
mud-shaolin-weapons-final-20261010
mud-teaching-chen-learning-20261009
mud-teaching-duan-tianlong-20261009
mud-teaching-emei-gumu-20261008
mud-teaching-feng-20261009
mud-teaching-gaibang-20261009
mud-teaching-henshan-songshan-20261009
mud-teaching-honghua-20261009
mud-teaching-hong-learning-20261009
mud-teaching-jiuyin-20261008
mud-teaching-kunlun-20261008
mud-teaching-lingjiu-xiaoyao-20261009
mud-teaching-lingxiao-meizhuang-20261009
mud-teaching-meizhuang-intro-20261009
mud-teaching-miao-murong-20261009
mud-teaching-mingjiao-20261009
mud-teaching-ouyang-shang-zhenyuan-20261009
mud-teaching-permission-20261008
mud-teaching-quanzhen-20261008
mud-teaching-quanzhen-learning-20261009
mud-teaching-report-20261008
mud-teaching-shang-letter-20261009
mud-teaching-taohua-20261008
mud-teaching-tiezhang-shenlong-20261009
mud-teaching-wudang-learning-20261009-v2
mud-teaching-wudu-20261008
mud-teaching-xingxiu-xuanming-20261009
mud-teaching-xueshan-xuedao-20261009
mud-weapon-material-20261008
mud-wudang-bout-final-20261010
mud-wudang-buffs-final-20261010
mud-wudang-condition-final-20261010
mud-wudang-dispel-final-20261010
mud-wudang-healing-final-20261010
mud-wudang-lookup-final-20261010
mud-wudang-public-force-final-20261010
```

## 后续保全记录（2026-10-12）

在上述盘点完成后，按原显式清单保全了现存 85 个系列和 42 个报告目录。长期位置为仓库外的 `C:/tools/msys64/home/oiuv/mud-evidence/martial-data`（下文记为 E）。本次仅复制尚未保全的 124 个根目录；此前已复制并逐文件核验的 `mud-martial-data-bepfmb`、`mud-martial-data-8mCjPr`、`mud-gumu-exert-final-20261011` 三个目录保持原样，没有覆盖或重复哈希。

| 保全范围 | 根目录数 | 文件数 | 字节数 |
|---|---:|---:|---:|
| 本次：样本数量齐全系列 | 75 | 930,309 | 11,567,882,284 |
| 本次：失败或中止留证系列 | 8 | 82,405 | 659,299,051 |
| 本次：报告目录 | 41 | 82 | 158,852,131 |
| 本次合计 | 124 | 1,012,796 | 12,386,033,466 |
| 此前已核验三份 | 3 | 23,813 | 278,848,107 |
| 原现存清单合计 | 127 | 1,036,609 | 12,664,881,573 |

这些是目录内全部文件的保全数量，不是样本数或成功采集批数；审计清单和未完成的中间副本不计入表内。来源预检于北京时间 2026-10-11 21:36:14 完成，核对了显式路径、目录边界、重解析点及目标冲突。复制于 2026-10-12 00:13:17 完成，辅助进程退出 0；每个文件均比较源与目标 SHA256，每个目录均核对复制前后的相对清单、大小和源文件修改时间，复制及哈希错误为 0。随后于 00:13:57 完成独立总清单核验：124 份分目录清单哈希、相对文件清单哈希、目标去向与分类总计一致，无重复、漏项或越界；此终检没有再次读取全部原始文件，也没有重新验收样本数值。

机器可读记录：

- [合并保全清单](../../../mud-evidence/martial-data/preservation-20261011T135158498Z/manifest.json)：覆盖本次 124 根，引用先完成的 42 份与后完成的 82 份分目录清单，记录实际来源、目标及每个文件的 SHA256。总清单 SHA256 为 `7e6acfb0c84e728cf8192f9d91ec92618678b0ea6dd6526ab11d9ae0230e0258`。
- [独立清单核验记录](../../../mud-evidence/martial-data/preservation-20261011T135158498Z/verification-20261011T161357081Z.json)：另列此前三份与 124 + 3 的合计；记录 SHA256 为 `a9ba62291870eb444bba028d60090ee25e9a9a5937a6025a8bd3cadfa2fc8d52`。
- [原始保全计划](../../../mud-evidence/martial-data/preservation-20261011T133851665Z/plan.json)：保留盘点时本文 SHA256 `ee9a644f6d73932cf58a8777496d599db959ec4a6b129bf6e7b67adb173ac6e9`。本文后续补充说明不改写该时点记录。

除以下两项外，有效副本均为 `E/<原目录名>`。复制辅助进程切换并发方式时留下的两份中间目标没有删除、覆盖或计为成功，完整副本另建于下列路径：

| 系列 | 已核验有效副本（相对于 E） | 保留但未完整核验的中间目标（相对于 E） |
|---|---|---|
| 0dr80P | `continuation-20261011T135158498Z/mud-martial-data-0dr80P` | `mud-martial-data-0dr80P` |
| 0ZMNYj | `continuation-20261011T135158498Z/mud-martial-data-0ZMNYj` | `mud-martial-data-0ZMNYj` |

本次没有移动、删除或覆盖原件，没有改写原元数据中的绝对路径。读取副本时应依据清单定位，不能把元数据仍指向 Temp 误认为产生了新系列。保全只证明这些现存文件在复制时逐字节一致，不提升八个失败系列的状态，不补回 259 个当前不可复核系列，也不纳入盘点之后新启动的采集目录。缺失原因仍未知。

### 工具源码与运行输入的保存边界

当前 [createSandbox](../../tools/tests/martial_data/execution.mjs) 将筛选后的公开游戏源码和 LPC 夹具复制到 attempt 的 `mudlib`；部分武器夹具由原模板生成，观察探针写入隔离副本，并登记原文、改写后哈希及替换位置。MJS 采集工具和条件模块则只读取内容计算 SHA256，记入 `series.json` 的 `identity.execution.source_files`，没有将这些 MJS 源码复制进系列。启动前比较同一输入清单哈希，不等于保存了工具正文。

独立检查本次 83 个系列的完整保全文件清单，未见 `.mjs`、`.js` 或 `.cjs` 源码文件。例如 `y8YyBt` 的系列元数据有 126 项 MJS 哈希，但系列中没有对应源码副本。因此准确口径是“运行时输入 SHA 已核验，游戏与 LPC 夹具副本已保留”，不能表述为“全部采集工具源码已有冻结副本”或“单凭该系列即可恢复原工具版本”。如果仓库工具后来发生变化，必须取得对应版本并核对哈希，不能从摘要或哈希反推出原工具内容。本次只说明已有证据边界，不改工具或历史元数据。

## 后续使用约束

### 当前采集器的清理行为复核

对 `tools/collect_martial_data.mjs`、`tools/tests/martial_data/` 及关联辅助路径作只读核查，采集主链未找到删除系列清单、样本、attempt结果或原事件的执行路径。[锁释放](../../tools/tests/martial_data/continuation.mjs)只删除自身token对应的 `collector.lock`，旧锁改名保留；[执行器cleanup](../../tools/tests/martial_data/execution.mjs)只清计时器、连接和信号监听。[台账](../../tools/tests/martial_data/ledger.mjs)独占新建并保留中断文件，禁止覆盖已有记录；原事件使用追加写入。初次复核所记的“唯一递归删除”仅适用于当时核查所见的 [baseline_report单元测试](../../tools/tests/martial_data/baseline_report.test.mjs)，不能当作当前整个测试目录的结论。2026-10-12 复核时，[领物](../../tools/tests/martial_data/gumu_item_acquisition.test.mjs)、[拜师](../../tools/tests/martial_data/gumu_recruit.test.mjs)等多份后续单元测试也有递归清理；所核路径均来自该次测试自行 `mkdtemp` 新建的独立前缀目录，不接收历史采集路径。存在清理代码不等于这些代码曾删除旧系列。

2026-10-12 仅对以下三个已列明的旧系列及指定文件作精确抽核，没有重新递归盘点整个临时目录或备份：

| 系列／attempt（相对上述临时目录） | 本次直接观察 |
| --- | --- |
| `mud-martial-data-Llkk2C/runs/attempt-dG5RVN` | 系列和 attempt 目录仍在；`samples`、`mudlib/log` 目录不存在。 |
| `mud-martial-data-jxdG9I/runs/attempt-rWmRgC` | 系列和 attempt 目录仍在；`samples`、`mudlib/log` 目录不存在。 |
| `mud-martial-data-6d2Imq/runs/attempt-JrVgO1` | 系列和 attempt 目录仍在；`samples`、`mudlib/log`、`mudlib/tests` 目录存在，但各自顶层为空。 |

三者均缺系列根的 `series.json`，以及 attempt 内的 `result.json`、`process.json`、`mudlib/log/events.jsonl`。逐一选查的 `mudlib/driver.cfg`、`mudlib/tests/options.json`、`mudlib/tests/runner.lpc`、`mudlib/tests/runner.c`、`mudlib/tests/teaching_observer.lpc`、`mudlib/adm/daemons/combatd.c`、`mudlib/kungfu/skill/tanzhi-shentong.c` 也均不存在。因此缺项不只涉及原事件文件名，所选配置、夹具与游戏源码同样缺失；这不代表已穷尽目录内所有文件，也不能确定文件为何消失。限定源码、Git 历史及记录检查未找到针对这三个系列删除、移动或改名的直接执行证据。维护者已确认没有做过清理，原因仍未知。

清单、进程记录、事件与结果分阶段产生，因此前置失败可能造成后续文件从未生成；这不能解释已完成旧系列的原件缺失。相关新采集工具尚未提交，Git没有可还原的旧版本历史；本次只能说明当前代码，不据此排除曾使用不同版本或其他外部操作，也不认定任何缺失原因。此复核未删除、恢复或重采证据，不改变上文可用性清单。

新采集仍按原独立系列与严格校验流程继续；本次可用性盘点不改变游戏源码、条件矩阵、采样量或原失败结论。已有结果若要重新统计，必须先取得对应系列清单、样本账本与原事件，再核对一致性；只有摘要、目录残余或历史指纹不能替代这些原件。

本表保留上述时点与清单范围。后续若确认备份、恢复原件或增加外部保全位置，应另记来源和验证结果，不静默把本次“不可复核”改写成“当时已完整”。维护者已确认没有做过清理，缺失原因仍然未知；初次盘点没有确认其他目录中是否存在备份，后续保全只覆盖当时尚存的文件，不将临时目录缺项归因于用户、系统或任何具体程序与操作。后续新启动故障属于独立环境问题，不并入本次冻结的 344 个系列清单。
