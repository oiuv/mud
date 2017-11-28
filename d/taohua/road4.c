inherit ROOM;
 
void create()
{
        set("short", "小路");
        set("long", @LONG
这是一条通往后山的小径。小路两旁长满了杂草。由于人
们很少走这条路，甚至连路中央也稀稀疏疏冒出了草芽。东边
有一个小山洞。
LONG);
        set("exits", ([
            "east"   : __DIR__"road5",
            "north"  : __DIR__"road2",
        ]));
        set("objects", ([
            "/clone/beast/dushe": 4,
        ]) );
        set("outdoors", "taohua");
        setup();
        replace_program(ROOM);
}
