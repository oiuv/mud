inherit ROOM;

void create()
{
        set("short","走廊");
        set("long",@LONG
这是一条长长的走廊，通向各个客人的寝室。两侧木壁上或
刻有花鸟鱼虫，或挂了些许时人的字画，每隔七八步，就有
一处香台，缕缕青烟从铜鹤嘴里游出，闻之精神一振。
LONG);
        set("exits", ([
                "west"  : __DIR__"westroom1",
                "north" : __DIR__"zoulang5",
                "south" : __DIR__"zoulang1",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
