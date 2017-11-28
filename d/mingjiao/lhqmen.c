//lhqmen.c

inherit ROOM;

void create()
{
        set("short", "烈火旗大门");
        set("long", @LONG
这里是明教烈火旗的大门，庄严古朴，门前对插四面镶红飞
龙旗。金色门钉扣在火漆红门上，分外精神。也是通往明教总舵
的必经之地。所以来往的人也特别多。
LONG );
        set("exits", ([
                "enter"     : __DIR__"lhqyuan",
                "southdown" : __DIR__"lhqpaifang",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "mingjiao");
        setup();
        replace_program(ROOM);
}
