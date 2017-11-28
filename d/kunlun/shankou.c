inherit ROOM;

void create()
{
	set("short", "昆仑山垭口");
        set("long", @long
这是位于两山之间的一个小山口。只见昆仑山脉绵延千里，
群山复叠，山上的树木并不多，还不时露出光秃秃的山面和石
头，山腰以上均为冰雪覆盖，冰峰雄峙，高插云霄。
long);
	set("exits",([
		"west" : __DIR__"klshanlu",
		"southeast" : __DIR__"kekexili",
	]));

	set("outdoors", "kunlun");
	setup();
	replace_program(ROOM);
}
