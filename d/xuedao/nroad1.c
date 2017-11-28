inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
这是一条崎岖的山路，马队到了这里就不能在上去了。山
路两旁杂草从生，路开始越来越难走。山路越走越窄，能隐隐
望见前方又分出了几条叉路。
LONG);
        set("exits", ([
                "west"  : __DIR__"nroad2",
                "south" : __DIR__"nroad0",
                "north" : __DIR__"nroad5",
        ]));
        set("outdoors", "xuedao");
        setup();
        replace_program(ROOM);
}

