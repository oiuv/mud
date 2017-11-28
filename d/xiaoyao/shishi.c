inherit ROOM;

void create()
{
	set("short", "石室");
	set("long", @LONG
这是一个石头砌成的房间，因为好久没有人来过，散发着
些很难闻的气味，房间中到处可以看到蛛丝和虫迹。
LONG);
	set("exits", ([
		"up" : __DIR__"midao",
	]));

	set("objects",([
		__DIR__"obj/putuan" : 1,
	]));

	set("objects",([
		CLASS_D("xiaoyao") + "/wuyazi" : 1,
	]));

	setup();
	replace_program(ROOM);
}
