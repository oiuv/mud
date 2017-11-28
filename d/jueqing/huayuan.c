inherit ROOM;

void create()
{
        set("short", "后花园");
        set("long", @LONG
这是绝情谷的后花园，但见园中群花争奇斗艳，偶闻花香
扑鼻，醉人心扉。四周翠木丛生，飞禽追逐嬉戏，别有一番景
致。
LONG);
        set("exits", ([
               "north"   : __DIR__"zizhuxuan",
               "west"    : __DIR__"xiaojing",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
