inherit ROOM;

void create()
{
        set("short", "青石路");
        set("long", @LONG
出了石林，就到了昆明的官道，青石铺成，平坦宽阔，西
去不远就是昆明了。
LONG);
        set("outdoors", "kunming");

        set("exits", ([
                "west" : __DIR__"qingshilu1", 
                "east" : __DIR__"shilin2",
        ]));
        setup();
        replace_program(ROOM);
}
