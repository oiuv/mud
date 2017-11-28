inherit ROOM;

void create()
{
        set("short", "雪山山脚");
        set("long", @LONG
这里是山脚下的一片平地，山上不远处，皑皑白雪映照下
的一大片红墙金瓦处，就是远近闻名的雪山寺。
LONG);
        set("outdoors", "xuedao");
        set("exits", ([
                "westup" : "/d/xuedao/nroad7",
                "south"  : __DIR__"hubian4",
        ]));
        setup();
        replace_program(ROOM);
}
