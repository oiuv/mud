inherit ROOM;

void create()
{
        set("short", "官道");
        set("long", @LONG
此处是个叉路，往西不远是开封，往东可到中州，西北通
往北岳恒山。不少游人顺着这条路往山上去。
LONG);
        set("exits", ([
  		"west" : "/d/kaifeng/tokaifeng",
  		"east" : __DIR__"wroad2",
	]));
        set("outdoors", "zhongzhou");

        setup();
        replace_program(ROOM);
}
