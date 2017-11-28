// shimen.c 洞门


inherit ROOM;

void create()
{
        set("short", "石门");
        set("long", @LONG
这里已是甬道尽头，面前一道厚重的石门。门上刻着三个斗大的
古篆：「侠客行」。年深日久，那笔划的凹下之处都积满了青苔，越
发显得沧桑，你心中的敬意油然而生。
    里面是一块大石壁，在石壁下好象有很多人。
LONG );
        set("exits", ([
                "enter" : __DIR__"shibi",
                "north" : __DIR__"yongdao3",
        ]));

        set("objects", ([
                __DIR__"npc/dizi3" : 1]));
        setup();
        replace_program(ROOM);
}
