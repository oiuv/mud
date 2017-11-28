inherit ROOM;

void create()
{
	set("short", "黄羊滩");
	set("long", @LONG
这里就是灵州西南著名的黄羊滩，本来是黄河边的一大片
水泽盐碱地，黄河水泛滥后退去形成了一大片低洼水滩，上面
水草丰盛，春秋两季吸引了大批塞北的野生黄羊到这里来饮水
嬉戏，休养生息，成为塞上一大景观。
LONG);
	set("exits", ([
		"north"     : __DIR__"nanmen",
		"southwest" : __DIR__"xiaoba",
	]));
	set("no_clean_up", 0);
	set("objects", ([
		"/clone/quarry/yang3" : 1,
	]));
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

