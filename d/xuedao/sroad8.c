#include <ansi.h>
inherit ROOM;

#define QIANGPU   "/clone/lonely/book/zhongping"

void create()
{
        set("short", "雪山山谷");
        set("long", @LONG
一个宽大山谷，群山环绕，山顶上全是白闪闪的积雪，山
谷南方有两个山洞。附近有几棵说不出什么名字的古树，下面
有一些乱七八糟的零碎(mash)堆摆在那里。
LONG );
        set("exits", ([
                "enter"    : __DIR__"shandong1",
                "eastdown" : __DIR__"wangyougu",
                "northup"  : __DIR__"sroad7",
        ]));
        set("outdoors", "xuedao");
        setup();
}

void init()
{
        object ob;

        ob = find_object(QIANGPU);
        if (! ob) ob = load_object(QIANGPU);

        if (! environment(ob))
        {
                set("item_desc", ([
                        "mash": HIR "\n这是一些乱七八糟的零碎，散发出阵阵恶心的"
                                "臭味。你定睛看\n去，零碎中居然有本" NOR + CYN
                                "「中平枪谱」" HIR "(zhongping qiangpu)" HIR "。"
                                "\n\n" NOR,

                        "zhongping qiangpu" : CYN "这是本薄薄的书册，封皮上用正"
                                              "楷写有「中平枪法」四个大字。\n" NOR,

                        "zhongping" : CYN "这是本薄薄的书册，封皮上用正楷写有「"
                                      "中平枪法」四个大字。\n" NOR,

                        "qiangpu"   : CYN "这是本薄薄的书册，封皮上用正楷写有「"
                                      "中平枪法」四个大字。\n" NOR,

                ]));
                add_action("do_get", "get");
        } else
        {
                set("item_desc", ([
                        "mash": HIR "\n这是一些乱七八糟的零碎，散发出阵阵恶心的"
                                "臭味。\n" NOR,
                ]));
        }
        add_action("do_enter", "enter");
}

int do_get(string arg)
{
        object me, ob;

        me = this_player();
        ob = find_object(QIANGPU);
        if (! ob) ob = load_object(QIANGPU);

        if (environment(ob)) return 0;

        if (! arg || arg == "" ) return 0;

        if (arg == "zhongping qiangpu from mash"
           || arg == "zhongping from mash"
           || arg == "qiangpu from mash"
           || arg == "book from mash"
           || arg == "all from mash"
           || arg == "pu from mash")
        {
                ob->move(me, 1);
                message_vision(HIY "\n$N" HIY "从零碎中翻出一本「中平枪法」。\n"
                               "\n" NOR, me);

                set("item_desc", ([
                        "mash": HIR "\n这是一些乱七八糟的零碎，散发出阵阵恶心的"
                                "臭味。\n" NOR,
                ]));
                return 1;
        }
        return 0;
}

int do_enter(string arg)
{
        object me;

        me = this_player();

        if (arg != "mash")
                return notify_fail("你要进入什么？\n");

        if (me->query("family/family_name") != "血刀门")
                return notify_fail(HIR "\n你翻了一下这些零碎，只觉一股"
                                   "血腥气翻涌上来，直欲呕吐。\n" NOR);

        message("vision", HIY "\n" + me->name() + HIY "走到一边不知道在"
                          "鬼鬼祟祟地干些什么，突然人就不见了。\n\n" NOR,
                          this_object(), ({ me }));

        tell_object(me, HIY "\n你蹑手蹑脚掀开这些零碎，越了下去，直穿过"
                        "密道奔扬州而去。\n\n" NOR);
        me->move("/d/city/xdmidao1");
        return 1;
}
