inherit ROOM;

void create()
{
        set("short", "中州北门");
        set("long", @LONG
这里已经到了中州的北门了，高高的城墙的砖缝里长满了
草。走过城门，再过了护城河，就是城外了。
LONG);
        set("outdoors", "zhongzhou");
        set("exits", ([
  		"north" : __DIR__"to_zhongzhou3",
  		"south" : __DIR__"wendingbei4",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
  		"/d/kaifeng/npc/guanbing" : 4,
  		"/d/beijing/npc/ducha" : 1,
	]));
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
