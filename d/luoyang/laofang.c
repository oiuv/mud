inherit ROOM;

void create()
{
	set("short", "牢房");
	set("long", @LONG
这里是牢房，四面都用铁栏杆围住，正面有一扇小铁门锁着，后面高
处有一扇窗，用于透气，微弱的光线从窗外射了进来，整个牢房就是一个
大铁笼，用来关一些罪大恶极的犯人。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"south" : __DIR__"xunbu",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
