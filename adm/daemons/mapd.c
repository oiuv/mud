// mapd.c

// #pragma optimize
// #pragma save_binary

#include <ansi.h>

// 标识对应的地名
mapping map_short = ([
        "xiyu"      : "西域",
        "gaochang"  : "高昌附近",
        "xingxiu"   : "星宿海",
        "guanwai"   : "关外",
        "city"      : "扬州",
        "fuzhou"    : "福州",
        "xiangyang" : "襄阳",
        "suzhou"    : "苏州",
        "hangzhou"  : "杭州",
        "quanzhou"  : "泉州",
        "lingzhou"  : "灵州",
        "chengdu"   : "成都",
        "jingzhou"  : "荆州",
        "jiaxing"   : "嘉兴",
        "nanyang"   : "南阳",
        "foshan"    : "佛山",
        "dali"      : "大理",
        "changan"   : "长安",
        "wugong"    : "武功",
        "hengyang"  : "衡阳",
        "beijing"   : "北京",
        "shaolin"   : "少林",
        "wudang"    : "武当",
        "emei"      : "峨嵋",
        "qingcheng" : "青城",
        "mingjiao"  : "昆仑山",
        "quanzhen"  : "终南山",
        "henshan"   : "衡山",
        "taishan"   : "泰山",
        "huashan"   : "华山",
        "hengshan"  : "恒山",
        "songshan"  : "嵩山",
        "huanghe"   : "黄河",
        "lingjiu"   : "天山",
        "gumu"      : "古墓",
        "meizhuang" : "梅庄",
        "tianlongsi": "天龙寺",
        "xueshan"   : "雪山",
        "taohua"    : "桃花岛",
        "baituo"    : "白驼山",
        "shenlong"  : "神龙岛",
        "yanziwu"   : "燕子坞",
        "village"   : "华山村",
        "xiakedao"  : "侠客岛",
        "xiaoyao"   : "逍遥林",
        "wanjiegu"  : "万劫谷",
        "xuedao"    : "大雪山",
        "guiyun"    : "归云庄",
        "heimuya"   : "黑木崖",
        "motianya"  : "摩天崖",
        "nanhai"    : "南海之滨",
        "tiezhang"  : "铁掌山",
        "kaifeng"   : "开封",
        "ruzhou"    : "汝州",
        "zhongzhou" : "中州",
        "luoyang"   : "洛阳",
        "lingxiao"  : "凌霄城",
        "lanzhou"   : "兰州",
        "wudujiao"  : "五毒教",
        "honghua"   : "红花会",
        "kunming"   : "昆明",
        "jueqing"   : "绝情谷",
]);

// 标识对应的地图帮助文件(全部在HELP_DIR中)
mapping map_to = ([
        "xiyu"      : "map_xy",
        "gaochang"  : "map_xy",
        "xingxiu"   : "map_xxh",
        "guanwai"   : "map_gw",
        "city"      : "map_yz",
        "fuzhou"    : "map_fz",
        "xiangyang" : "map_xi",
        "suzhou"    : "map_sz",
        "hangzhou"  : "map_hz",
        "quanzhou"  : "map_qz",
        "lingzhou"  : "map_lz",
        "chengdu"   : "map_cd",
        "jingzhou"  : "map_jz",
        "jiaxing"   : "map_jx",
        "nanyang"   : "map_ny",
        "foshan"    : "map_fs",
        "dali"      : ({ "map_dl", "map_dls" }),
        "changan"   : "map_ca",
        "wugong"    : "map_wg",
        "hengyang"  : "map_hy",
        "beijing"   : "map_bj",
        "shaolin"   : "map_sl",
        "wudang"    : "map_wd",
        "emei"      : "map_em",
        "qingcheng" : "map_qc",
        "mingjiao"  : "map_kl",
        "quanzhen"  : ({ "map_zn", "map_cyg" }),
        "henshan"   : ({ "map_ss", "map_hy" }),
        "taishan"   : "map_es",
        "huashan"   : "map_ws",
        "hengshan"  : "map_ns",
        "songshan"  : "map_cs",
        "huanghe"   : "map_hh",
        "lingjiu"   : "map_ljg",
        "gumu"      : "map_gm",
        "meizhuang" : "map_mz",
        "tianlongsi": "map_tls",
        "xueshan"   : "map_xss",
        "taohua"    : "map_thd",
        "baituo"    : "map_bts",
        "shenlong"  : "map_sld",
        "yanziwu"   : "map_yzw",
        "village"   : "map_hsc",
        "xiakedao"  : "map_xkd",
        "xiaoyao"   : "map_xyl",
        "wanjiegu"  : "map_wjg",
        "xuedao"    : "map_xdm",
        "guiyun"    : "map_gyz",
        "heimuya"   : "map_hmy",
        "motianya"  : "map_mty",
        "nanhai"    : "map_nh",
        "tiezhang"  : "map_tz",
        "kaifeng"   : "map_kf",
        "ruzhou"    : "map_rz",
        "zhongzhou" : "map_zz",
        "luoyang"   : "map_ly",
        "lingxiao"  : "map_lxg",
        "lanzhou"   : "map_la",
        "wudujiao"  : ({ "map_wdj", "map_dls" }),
        "honghua"   : "map_hhh",
        "kunming"   : "map_km",
        "jueqing"   : "map_jqg",
]);

// 各地交通联络地
mapping map_trans = ([
        "beijing"   : ([ "name" : "北京",     "room" : "/d/beijing/majiu", ]),
        "yangzhou"  : ([ "name" : "扬州",     "room" : "/d/city/majiu", ]),
        "dali"      : ([ "name" : "大理",     "room" : "/d/dali/majiu", ]),
        "foshan"    : ([ "name" : "佛山",     "room" : "/d/foshan/majiu", ]),
        "fuzhou"    : ([ "name" : "福州",     "room" : "/d/fuzhou/majiu", ]),
        "guanwai"   : ([ "name" : "关外",     "room" : "/d/guanwai/majiu", ]),
        "hangzhou"  : ([ "name" : "杭州",     "room" : "/d/hangzhou/majiu", ]),
        "lanzhou"   : ([ "name" : "兰州",     "room" : "/d/lanzhou/majiu", ]),
        "lingzhou"  : ([ "name" : "灵州",     "room" : "/d/lingzhou/majiu", ]),
        "luoyang"   : ([ "name" : "洛阳",     "room" : "/d/luoyang/majiu", ]),
        "yongdeng"  : ([ "name" : "永登",     "room" : "/d/huanghe/majiu", ]),
        "suzhou"    : ([ "name" : "苏州",     "room" : "/d/suzhou/majiu", ]),
        "xiangyang" : ([ "name" : "襄阳",     "room" : "/d/xiangyang/majiu", ]),
        "yili"      : ([ "name" : "伊犁",     "room" : "/d/xingxiu/majiu", ]),
        "chengdu"   : ([ "name" : "成都",     "room" : "/d/city3/majiu", ]),
        "emei"      : ([ "name" : "峨嵋山",   "room" : "/d/emei/majiu1", ]),
        "emei2"     : ([ "name" : "峨嵋半山", "room" : "/d/emei/majiu2", ]),
        "quanzhou"  : ([ "name" : "泉州",     "room" : "/d/quanzhou/majiu1", ]),
        "jiaxing"   : ([ "name" : "嘉兴",     "room" : "/d/quanzhou/majiu2", ]),
        "jingzhou"  : ([ "name" : "荆州",     "room" : "/d/jingzhou/majiu", ]),
        "nanyang"   : ([ "name" : "南阳",     "room" : "/d/shaolin/majiu1", ]),
        "changan"   : ([ "name" : "长安",     "room" : "/d/changan/majiu", ]),
        "wugong"    : ([ "name" : "武功镇",   "room" : "/d/quanzhen/majiu", ]),
        "hengyang"  : ([ "name" : "衡阳",     "room" : "/d/henshan/majiu", ]),
        "kaifeng"   : ([ "name" : "开封",     "room" : "/d/kaifeng/majiu", ]),
        "kunming"   : ([ "name" : "昆明",     "room" : "/d/kunming/majiu", ]),
        "zhongzhou" : ([ "name" : "中州",     "room" : "/d/zhongzhou/majiu", ]),
]);


// 交通连接
mixed connect_info = ({
        ({ "beijing", "guanwai",        300, }),
        ({ "beijing", "lingzhou",       300, }),
        ({ "beijing", "changan",        200, }),
        ({ "beijing", "xiangyang",      180, }),
        ({ "beijing", "luoyang",        160, }),
        ({ "beijing", "nanyang",        150, }),
        ({ "beijing", "kaifeng",        160, }),
        ({ "beijing", "zhongzhou",      150, }),
        ({ "beijing", "yangzhou",       200, }),
        ({ "lingzhou", "yili",          250, }),
        ({ "lingzhou", "kaifeng",       180, }),
        ({ "lingzhou", "lanzhou",       120, }),
        ({ "lingzhou", "yongdeng",      100, }),
        ({ "lingzhou", "changan",       200, }),
        ({ "luoyang", "kaifeng",        140, }),
        ({ "luoyang", "changan",        100, }),
        ({ "luoyang", "yangzhou",       160, }),
        ({ "luoyang", "xiangyang",      100, }),
        ({ "luoyang", "zhongzhou",      120, }),
        ({ "luoyang", "wugong",          80, }),
        ({ "luoyang", "nanyang",        120, }),
        ({ "changan", "yili",           250, }),
        ({ "changan", "lanzhou",        100, }),
        ({ "changan", "wugong",          50, }),
        ({ "changan", "xiangyang",      200, }),
        ({ "changan", "nanyang",        200, }),
        ({ "changan", "kaifeng",        160, }),
        ({ "changan", "zhongzhou",      100, }),
        ({ "changan", "chengdu",        250, }),
        ({ "changan", "jingzhou",       230, }),
        ({ "changan", "yangzhou",       260, }),
        ({ "yangzhou", "nanyang",       100, }),
        ({ "yangzhou", "kaifeng",       120, }),
        ({ "yangzhou", "xiangyang",     150, }),
        ({ "yangzhou", "hengyang",      250, }),
        ({ "yangzhou", "suzhou",         80, }),
        ({ "yangzhou", "zhongzhou",      80, }),
        ({ "yangzhou", "hangzhou",      120, }),
        ({ "yangzhou", "jiaxing",       150, }),
        ({ "nanyang", "kaifeng",         50, }),
        ({ "nanyang", "zhongzhou",      120, }),
        ({ "xiangyang", "chengdu",      200, }),
        ({ "xiangyang", "jingzhou",      80, }),
        ({ "xiangyang", "dali",         400, }),
        ({ "xiangyang", "kunming",      500, }),
        ({ "xiangyang", "hengyang",     200, }),
        ({ "xiangyang", "zhongzhou",     80, }),
        ({ "chengdu", "jingzhou",       140, }),
        ({ "chengdu", "kunming",        220, }),
        ({ "chengdu", "emei",           150, }),
        ({ "chengdu", "dali",           300, }),
        ({ "dali",  "jingzhou",         180, }),
        ({ "dali",  "kunming",          150, }),
        ({ "emei",  "kunming",          120, }),
        ({ "emei",  "jingzhou",         140, }),
        ({ "emei",  "emei2",             20, }),
        ({ "hengyang", "foshan",        150, }),
        ({ "suzhou", "hangzhou",         80, }),
        ({ "suzhou", "jiaxing",         120, }),
        ({ "suzhou", "quanzhou",        150, }),
        ({ "suzhou", "zhongzhou",        80, }),
        ({ "hangzhou", "jiaxing",        50, }),
        ({ "hangzhou", "quanzhou",      150, }),
        ({ "hangzhou", "fuzhou",        140, }),
        ({ "lanzhou", "yongdeng",       100, }),
        ({ "lanzhou", "yili",           160, }),
        ({ "jiaxing", "fuzhou",         130, }),
        ({ "jingzhou", "kunming",       140, }),
        ({ "fuzhou", "quanzhou",         30, }),
        ({ "kaifeng", "yongdeng",       110, }),
        ({ "kaifeng", "zhongzhou",      100, }),
});

// 查看某个地点是否被MAPD所知晓
public int been_known(string outdoors)
{
        return stringp(map_short[outdoors]);
}

// 获得某个户外地点的中文名字
public string query_map_short(string outdoors)
{
        string str;

        if (stringp(str = map_short[outdoors]))
                return str;

        return "不详地点";
}

// 获得所有户外地点的集合
public string *query_all_map_zone()
{
        return keys(map_short);
}

// 获得某个户外地点的地图
public string query_maps(string outdoors)
{
        mixed maps;
        string file;
        string map_result;

        if (undefinedp(maps = map_to[outdoors]))
                return "未有详细地图。\n";

        if (stringp(maps))
        {
                file = HELP_DIR + maps;
                map_result = read_file(file);
                if (! stringp(map_result))
                        map_result = "无法读取地图" + file + "。\n";
                map_result = color_filter(map_result);
                return map_result;
        }

        if (arrayp(maps))
        {
                map_result = "";
                foreach (file in maps)
                {
                        if (file_size(HELP_DIR + file) > 0)
                                map_result += read_file(HELP_DIR + file);
                        else
                                map_result += "无法读取地图" + file + "。\n";
                }
                map_result = color_filter(map_result);
                return map_result;
        }

        error("未知错误。\n");
}

// 获得地图中某一行的第x开始的n个字符，其中地图行中@打头的字
// 符及后续字符一概认为不占地方。比如"@B123@E"，则第二个字符
// 是'2'，而不是B。如果n为-1，则返回一直到末尾的所有字符
//
// 这样存在问题，有必要引入一个变量， 标识是否取回颜色，不过
// 由于出错的几率相当小，所以姑且不计。
string get_map_line(string line, int x, int n)
{
        string rs;

        rs = "";
        if (n == 0)
                return rs;

        // 找到相应的位置
        while (x)
        {
                if (strlen(line) == 0)
                        // 字符串长度不够
                        return rs;

                if (line[0] == '@')
                {
                        if (strlen(line) >= 2)
                                // 去掉@和后续的字符
                                line = line[2..<1];
                        else
                                // 长度不够？返回空字符串
                                return rs;
                } else
                {
                        // 字符串去掉第一个字符，相当于向右移动
                        x--;
                        line = line[1..<1];
                }
        }

        // 截取n个字符
        // 为什么这里用do-while，而不直接用while？这是有原因
        // 的。
        rs = "";
        for (;;)
        {
                if (strlen(line) == 0)
                        // 已经无字符可取
                        return rs;

                if (line[0] == '@')
                {
                        if (strlen(line) >= 2)
                        {
                                rs += line[0..1];
                                line = line[2..<1];
                        } else
                        {
                                rs += line;
                                return rs;
                        }
                } else
                {
                        if (n == 0) break; // 结束截取
                        n--;
                        rs += line[0..0];
                        line = line[1..<1];
                        continue;
                }
        }
        return rs;
}

// 为地点标记颜色：名字必须为中文
// 标记的时候一行行扫描，扫描的同时打标记，将标记设置为@B和
// @E，如果扫描成功就把@B和@E替换成为@R和@N，否则就去掉这些
// 临时标记。
// 最后将将所有的标记替换成颜色：@R->WHT @N->NOR
public string mark_map(string map, string name)
{
        string *lines;
        string temp;
        string rs;
        int i;
        int x, y, xd;           // 比较的地图位置
        int n;

        // 去除地图的颜色：这样可以准确的判断绝对的坐标
        map = filter_color(map);

        // 将地图分成行
        lines = explode(map, "\n");
        for (i = 0; i < sizeof(lines); i++)
        {
                if (strsrch(lines[i], name[0..1]) == -1)
                        // 本行不存在名称的第一个汉字，继续，继续下一行
                        continue;

                x = 0;
                temp = replace_string(lines[i], "@R", "");
                temp = replace_string(temp, "@N", "");
                while (x < strlen(temp) - 1)
                {
                        xd = strsrch(temp[x..<1], name[0..1]);
                        if (xd == -1)
                                // 本行后续没有名称的第一个汉字，继续下一行
                                break;

                        // 该行匹配上了第一个汉字：比较后续的汉字，
                        // 首先横向比较，因此不断移动xd，如果横向扫
                        // 描不到，就往纵向比较，变化y。
                        x += xd;
                        y = i;
                        xd = 2;
                        rs = get_map_line(lines[y], 0, x);
                        rs += "@B";
                        rs += get_map_line(lines[y], x, 2);
                        for (n = 2; n < strlen(name); n += 2, xd += 2)
                        {
                                // 首先横向比较
                                if (x + xd + 2 <= strlen(lines[y]) &&
                                    get_map_line(lines[y], x + xd, 2) == name[n..n + 1])
                                {
                                        // 横向比较到了，继续横向比较
                                        rs += name[n..n + 1];
                                        continue;
                                }

                                // 横向比较失败了，横向还原对齐，纵向比较
                                rs += "@E" + get_map_line(lines[y], x + xd, -1);
                                xd = 0;
                                y++;
                                if (y < sizeof(lines) &&
                                    x + 2 <= strlen(lines[y]) &&
                                    get_map_line(lines[y], x, 2) == name[n..n + 1])
                                {
                                        // 纵向比较到了，继续横向比较
                                        lines[y - 1] = rs;
                                        rs = get_map_line(lines[y], 0, x);
                                        rs += "@B";
                                        rs += name[n..n + 1];
                                        continue;
                                }

                                // 比较失败，不在(x, i)这个位置
                                y--;
                                while (y >= i)
                                {
                                        // 恢复原先的地图，去掉标记
                                        lines[y] = replace_string(lines[y], "@B", "");
                                        lines[y] = replace_string(lines[y], "@E", "");
                                        y--;
                                }
                                break;
                        }

                        if (n >= strlen(name))
                        {
                                // 匹配成功
                                rs += "@E" + get_map_line(lines[y], x + xd, -1);
                                lines[y] = rs;
                                while (y >= i)
                                {
                                        // 将标记设置为正常标记
                                        lines[y] = replace_string(lines[y], "@B", "@R");
                                        lines[y] = replace_string(lines[y], "@E", "@N");
                                        y--;
                                }
                        }

                        // 移动x，继续匹配
                        x++;
                }
                // 扫描完毕一行，继续扫描下一行
        }
        // 处理完毕

        return implode(lines, "\n") + "\n";
}

// 获得所在某个地点的地图并标记当前所在的位置
public string marked_map(object env)
{
        mixed maps;
        string file;
        string outdoors;
        string map_result;
        int result_ok;

        if (! objectp(env))
                return "这里无法获得地图。\n";

        if (! stringp(outdoors = env->query("outdoors")))
                return "必须在室外察看所处的具体位置。\n";

        if (undefinedp(maps = map_to[outdoors]))
                return "未有详细地图。\n";

        if (stringp(maps))
        {
                file = HELP_DIR + maps;
                map_result = read_file(file);
                if (! stringp(map_result))
                        map_result = "无法读取地图" + file + "。\n";
                map_result = color_filter(map_result);
                map_result = mark_map(map_result, env->short());
        } else
        if (arrayp(maps))
        {
                map_result = "";
                result_ok = 0;
                foreach (file in maps)
                {
                        if (file_size(HELP_DIR + file) > 0)
                                map_result = read_file(HELP_DIR + file);
                        else
                        {
                                map_result = "无法读取地图" + file + "。\n";
                                result_ok = 1;
                                break;
                        }

                        map_result = color_filter(map_result);
                        map_result = mark_map(map_result, env->short());
                        if (strsrch(map_result, "@R") != -1)
                        {
                                result_ok = 1;
                                break;
                        }
                }
                // 所有的地图都没有变化？取第一个
                if (! result_ok)
                {
                        map_result = read_file(HELP_DIR + maps[0]);
                        map_result = color_filter(map_result);
                }
        } else
                error("未知错误。\n");

        map_result = replace_string(map_result, "@R", HIC);
        map_result = replace_string(map_result, "@N", NOR);
        return map_result;
}

// 玩家纪录传闻
public int record_rumor(mixed obs, string topic, mixed event_ob)
{
        object ob;
        string title;
        int n;

        if (objectp(obs)) obs = ({ obs }); else
        if (! arrayp(obs)) return 0;

        if (! stringp(title = event_ob->query_detail(topic)))
                return 0;

        if (stringp(event_ob)) event_ob = base_name(find_object(event_ob)); else
                               event_ob = base_name(event_ob);
        n = 0;
        foreach (ob in obs)
        {
                if (! playerp(ob) || ! ob->query("out_family")) continue;
                if (ob->query("rumor/" + topic)) continue;
                ob->set("rumor/" + topic, event_ob);
                message("vision", "你掏出地图册，翻到最后面，写下了有关『" +
                                  topic + "』的记录。\n", ob);
                n++;
        }

        return n;
}

// 获得某个交通地点的信息
public varargs mixed query_trans_info(string to)
{
        if (! stringp(to))
                return map_trans;

        return map_trans[to];
}

// 获得交通连接信息
public mapping query_connect_info()
{
        return connect_info;
}
