inherit ROOM;

void create()
{
        set("short", "宴厅");
        set("long", @LONG
屋子的中间摆有一张大桌子，足足可以坐下三十来人。房
子的一边通向正厅，另一边可以去厨房。红花会广接四方英杰
会中客人多时，往往这里都坐不下，干脆在前院露天设宴。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"hh_zoulang4",
	]));
        setup();
        replace_program(ROOM);
}
