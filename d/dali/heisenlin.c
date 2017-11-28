inherit ROOM;

void create()
{
	set("short", "大森林");
	set("long", @LONG
迎面一大片黑压压的森林，高大的古松参天而立。左首一
排九株大松树，看起来有些特别。北边一条黄土路通往昆明所
在，南边不远就是著名的滇池了。
LONG);
	set("outdoors", "kunming");
	set("exits", ([
                "south" : __DIR__"dasenlin",
                "northeast" : "/d/kunming/htroad3",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

