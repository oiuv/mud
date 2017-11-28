inherit ROOM; 
 
void create ()
{
  set ("short", "宴厅");
  set ("long", @LONG
屋子的中间有一张大桌子，足足可以坐下三十来人。房子的一边通向正厅，
另一边可以去厨房。镖局里的客人多时，往往这里都坐不下，干脆在前院空地
上露天设宴。
LONG);

  	set("exits", ([
  		"east" : __DIR__"kitchen_road1",
  		"west" : __DIR__"zhengting",
  		"north" : __DIR__"e_garden",
	]));

	setup(); 
	replace_program(ROOM); 
} 
