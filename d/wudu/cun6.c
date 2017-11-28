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
                "northwest" : __DIR__"cun4",
                "northeast" : __DIR__"cun7",
                "southwest" : __DIR__"minju5",
                "southeast" : __DIR__"minju6",
        ]));

        setup();
}

