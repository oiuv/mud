
#include <ansi.h>
inherit BUILD_ROOM;

int do_qian(string arg);

void create()
{
        set("short", "寒水潭");
        set("long", @LONG
这里是草地的边缘，青草已经很稀疏了，仍然有些许玉蜂
飞过寻觅食物。不远处是一个清波荡漾的大水潭 (tan)，水很
清，隐约可以见过水底的怪石嶙峋，一二游鱼倏地从水底游过，
又不知道躲到哪块石头后面藏身去了。阳光映照下，水面泛起
了一道七色彩虹，望着这般美景，你俗念尽消。
LONG
        );
        set("outdoors", "quanzhen");
        set("max_room", 3);
        set("exits", ([
                "northwest" : __DIR__"caodi2",
        ]));

        set("item_desc", ([
        "tan": HIW "\n一口很深的水摊，不知道可不可以潜(qian)下到这水底世界去？\n"NOR,
        ]) );

        setup();
}

void init()
{
        add_action("do_qian", "qian");
}


int do_qian(string arg)
{
        object me=this_player();

        if (! arg || arg != "tan" )
                return notify_fail("你要往哪里潜水？\n");

        message_sort(HIG "$N纵身一跃，跳入水摊之中，许多游鱼从"
                     "你身边游过，你伸手一捞，却抓了空。突然$N "
                     HIG "眼前一亮，一股暗流扑面而来，将$N" HIG 
                     "冲入一个所在。\n" NOR,this_player());

        me->move(__DIR__"mishi1");
        return 1;
}

