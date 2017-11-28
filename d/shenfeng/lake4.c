inherit ROOM;

void create()
{
        set("short", "大湖");
        set("long", @LONG
转了几个弯，从一排参天青松中穿了出去，登时惊得呆了。
眼前一片大湖，湖的南端又是一条大瀑布，水花四溅，日光映
照，现出一条彩虹，湖周花树参差，杂花红白相间，倒映在碧
绿的湖水之中，奇丽莫名。远处是大片青草平原，无边无际的
延伸出去，与天相接。
LONG);
        set("outdoors", "shenfeng");
        set("exits", ([
		"south" : __DIR__"caoyuan1",
		"east" : __DIR__"lake3",
		"west" : __DIR__"huijiang5",
	]));

        setup();
        replace_program(ROOM);
}
