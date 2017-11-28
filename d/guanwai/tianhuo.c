// /guanwai/tianhuo.c

inherit ROOM;

void create()
{
	set("short", "天豁峰");
	set("long", @LONG
乘槎河东岸，与龙门峰对峙。峰顶如鹰嘴般的峻峭山峰破石而出，伸向
天池，故又名鹰嘴峰。古书载：“峰起双尖，中辟一线，有豁然开朗、令人
不可思议之趣”，相传为大禹治水所劈，石多赤色，犹如二龙蟠踞，妙趣横
生。
LONG );
	set("exits", ([
		"south" : __DIR__"huagai",
		"west"  : __DIR__"longmen",
	]));
	set("no_clean_up", 0);
	set("outdoors", "guanwai");
	setup();
	replace_program(ROOM);
}
