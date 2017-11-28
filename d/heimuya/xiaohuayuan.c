//ROOM: xiaohuayuan.c

inherit ROOM;

void create()
{
	set("short", "小花园");
        set("long", @LONG
从昏暗的地道中出来，你发现自己竟是置身于一个极精致的
小花园中，红梅绿竹，青松翠柏，布置得颇具匠心，往东去是一
间精雅小舍。
LONG     );
        set("exits", ([
            "south" : __DIR__"didao6",
            "enter" :__DIR__"xiaoshe",   
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
