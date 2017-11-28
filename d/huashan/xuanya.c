// xuanya.c
inherit ROOM;
void create()
{
	set("short","悬崖");
	set("long",@LONG
这是华山上悬崖上的一片平台，地势险恶。平台旁便是万丈深渊，低
头望下，只见一天云海。华山弟子多在此练剑打坐，借天时地势，勤练武
功。平时华山掌门也在此指点及考教门下弟子。
LONG);
	set("exits",([
		"west" : __DIR__"houyuan",
	]));
	set("outdoors", "huashan");
        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}
 
