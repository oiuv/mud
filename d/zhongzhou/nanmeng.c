inherit ROOM;

void create()
{
        set("short", "中州南门");
        set("long", @LONG
到了中州的南城门了。出了城不远就是一大片的树林。听
说南城门外一带经常有土匪出没。可在这里把守的官兵比较多
所以城里倒也太平无事。
LONG);
        set("outdoors", "zhongzhou");
        set("exits", ([
  		"north" : __DIR__"wendingnan4",
  		"south" : __DIR__"nroad",
	]));
        set("objects", ([
                "/d/kaifeng/npc/guanbing" : 4,
                "/d/beijing/npc/ducha" : 1,
                "/clone/npc/walker" : 1,
        ]));
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
