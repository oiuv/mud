inherit ROOM;

void create()
{
	set("short", "羞花汀");
	set("long", @LONG
春月楼著名之处在这里可略见一斑，四边花草甚多，但唯有牡丹最胜。
那花不是寻常玉楼春之类，乃“姚黄”“魏紫”有名异品，一本价值五千。
那花正种在朱门对面，周围以湖石拦之。其花大如丹盘，五色灿烂，光华
夺目。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"north" : __DIR__"jiyuan2",
	]));

	setup();
	replace_program(ROOM);
}
