//Room: duchang.c

#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "赌场");
        set("long", @LONG
大厅里摆满大大小小的赌桌，只要能说出名的赌具，这里
都有。进来这里你首先听到的就是少女们吃吃的笑声和男人们
的吹牛声，掷骰子声……在这里，你几乎就可以听到世上所有
不规矩的声音。墙上挂着一块牌子(paizi)。
LONG);
        set("exits", ([
                "south" : __DIR__"qixiang3",
        ]));
        set("item_desc", ([
                "sign": @TEXT
赌骰子方法:
bet <kind> <amount> <money> 

只收现银，概不赊欠。

kind:
    头彩 <tc>（骰数由每次开盘前确定）      ：一赢三十六
    双对 <sd>（两骰号相同，且为偶数）      ：一赢十二
    七星 <qx>（两骰之和为七）              ：一赢六
    散星 <sx>（两骰之和为三，五，九，十一）：一赢三
TEXT
        ]));

        set("objects", ([
                __DIR__"npc/zhuangjia" : 1,
        ]));

        set("no_fight", 1);
        setup();
}
void init()
{
        add_action("do_bet", "bet");
}

int do_bet(string arg)
{
        //object me = this_player();
        object zj;
        
        if (! objectp(zj = present("zhuang jia", this_object())))
                return notify_fail("庄家都没有，你要和谁赌？\n");

        if (! living(zj))
                return notify_fail("你还是等庄家醒了再说吧！\n");

        return notify_fail("对不起，系统测试，目前停止营业！\n");


}

