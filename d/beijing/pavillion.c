inherit ROOM;

void create ()
{
  	set ("short", "清凉亭");
  	set ("long", @LONG
凉亭造得颇为精致，中间一石桌，桌上刻着横十九，纵十九的一张棋盘，
残局还未撤去。清晨来这里读书，夕阳西下时品茗谈天，当是人生一大快事。
LONG);

  	set("exits", ([
  		"south" : __DIR__"stone_road2",
	]));

  	setup();
        replace_program(ROOM);
}
