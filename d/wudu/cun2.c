inherit ROOM;

void create()
{
        set("short", "小村");
        set("long", @LONG
走在小村的石板路上，两旁都是用青石砌成的房屋。村子里静悄
悄的，看不到行人，偶尔传来一两声狗叫。 
LONG);
        set("outdoors", "wudujiao");

        set("exits", ([
                "east" : __DIR__"cun3",
                "south" : __DIR__"minju1",
                "west" : __DIR__"cun1",
        ]));

        setup();
}

