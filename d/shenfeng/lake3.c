inherit ROOM;

void create()
{
	set("short", "银瀑");
	set("long", @LONG
溪水转弯绕过一块高地，忽然眼前一片银瀑，水声轰轰不
绝，匹练有如自天而降，飞珠溅玉，顿成奇观。在这荒凉的大
漠之中突然见此美景，不觉身神俱爽，好奇心起，想看看瀑布
之上更有甚么景色。
LONG);
        set("outdoors", "shenfeng");
	set("exits", ([
  		"west" : __DIR__"lake4",
  		"south" : __DIR__"lake2",
	]));

	setup();
	replace_program(ROOM);
}
