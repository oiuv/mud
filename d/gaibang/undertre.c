#include <ansi.h>
inherit ROOM;
string look_map();

void create()
{
        set("short", "树洞下");
        set("long", @LONG
这是老槐树底部，四周光线昏暗，人影晃晃，似乎有几个
黑暗的洞口在你身边，通向四面八方。一位老乞丐大咧咧地坐
在正中的地上。墙壁上画着幅粗糙的路线(map)草图。
LONG);
        set("exits", ([
                "up"   : __DIR__"inhole",
                "west" : __DIR__"mishi",
                "east" : __DIR__"chucang",
        ]));

        set("item_desc",([
                "map"  : (: look_map :),
        ]));

        set("objects",([
                CLASS_D("gaibang") + "/liang" : 1,
                CLASS_D("gaibang") + "/jian" : 1,
                "/d/gaibang/npc/5dai" : 1,
                "/d/gaibang/npc/6dai" : 1,
                "/d/gaibang/npc/7dai" : 1,
        ]));
        setup();
        "/clone/board/gaibang_r"->foo();
}

void init()
{
        add_action("do_goto", "goto");
}

int do_goto(string arg)
{
        object midao, arrive;
        object me = this_player();
        string room, name;

        if (me->query("family/family_name") != "丐帮")
                return notify_fail(HIR "\n你朝密道走去，突闻一股恶臭"
                                   "从洞内传出，使你连忙止步。\n" NOR);

        if (! arg || arg == "")
                return notify_fail("你要去哪里？\n");

        switch (arg)
        {
        case "福州" :
        case "fuzhou" :
                room = "/d/fuzhou/yushan";
                name = "福州";
                break;

        case "襄阳" :
        case "xiangyang" :
                room = "/d/xiangyang/xiaorong1";
                name = "襄阳";
                break;

        case "苏州" :
        case "suzhou" :
                room = "/d/suzhou/chitang";
                name = "苏州";
                break;

        case "杭州" :
        case "hangzhou" :
                room = "/d/hangzhou/yuhuangshan";
                name = "杭州";
                break;

        case "成都" :
        case "chengdu" :
                room = "/d/city3/wuhouci";
                name = "成都";
                break;

        case "荆州" :
        case "jingzhou" :
                room = "/d/jingzhou/xxend";
                name = "荆州";
                break;

        case "南阳" :
        case "nanyang" :
                room = "/d/shaolin/ruzhou";
                name = "南阳";
                break;

        case "佛山" :
        case "foshan" :
                room = "/d/foshan/youtiaopu";
                name = "佛山";
                break;

        case "大理" :
        case "dali" :
                room = "/d/dali/dahejieeast";
                name = "大理";
                break;

        case "衡阳" :
        case "hengyang" :
                room = "/d/henshan/hengyang1";
                name = "衡阳";
                break;

        case "长安" :
        case "changan" :
                room = "/d/changan/minju3";
                name = "长安";
                break;

        case "北京" :
        case "beijing" :
                room = "/d/beijing/minju_y";
                name = "北京";
                break;

        case "开封" :
        case "kaifeng" :
                room = "/d/kaifeng/jiaomen";
                name = "开封";
                break;

        case "中州" :
        case "zhongzhou" :
                room = "/d/zhongzhou/inpomiao";
                name = "中州";
                break;

        case "洛阳" :
        case "luoyang" :
                room = "/d/luoyang/nantou";
                name = "洛阳";
                break;

        default:
                return notify_fail("没有通向那个方向的密道。\n");
                break;
        }
        arrive = find_object(room);

        if (! arrive)
                arrive = load_object(room);

        message_vision("$N耸了耸肩，朝" + name + "密道内走去。\n", me);

        midao = new(__DIR__"midao");
        me->move(midao);

        me->start_call_out((: call_other, __FILE__, "arrival",
                              me, midao, arrive :), 3);
        return 1;
}

void arrival(object me, object boat, object arrive)
{
        tell_object(me, HIY "\n你在漆黑的密道中穿梭着，突然"
                        "眼前一亮。\n\n" NOR);
        me->move(arrive);
}

string look_map()
{
        return WHT "\n"
"凡丐帮帮众均可通过密道直达以下城市：\n" HIY
"────────────────────\n" NOR
" 长安(changan)         洛阳(luoyang)\n"
" 大理(dali)            北京(beijing)\n"
" 杭州(hangzhou)        开封(kaifeng)\n"
" 苏州(suzhou)          衡阳(hengyang)\n"
" 襄阳(xiangyang)       福州(fuzhou)\n"
" 成都(chengdu)         荆州(jingzhou)\n"
" 南阳(nanyang)         佛山(foshan)\n"
" 中州(zhongzhou)\n" HIY
"────────────────────\n" NOR + WHT
"即来即走(" HIY "goto" NOR + WHT ")无需等待，仅限丐帮帮众。\n" NOR;
}
