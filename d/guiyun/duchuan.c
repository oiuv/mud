// Room: /guiyun/duchuan.c
// Date: Nov.18 1998 by Winder

inherit ROOM;

void create()
{
	set("short", "渡船");
	set("long", @LONG
离岸渐远，四望空阔，真是莫知天地之在湖海，抑或是湖海之
在天地。老梢公在船尾悠闲地划着水。
LONG );
        set("outdoors", "city");
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}
