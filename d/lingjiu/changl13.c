inherit ROOM;

void create()
{
  	set("short", "画廊");
  	set("long", @LONG
这是一条非常精美的长廊，柱子和栏杆是用华贵的紫檀木
制成，上面雕饰着一些美丽的图画，画工精巧，美不胜收。地
板不知是用什么材料做的，走在上面毫无声息，你只感到脚下
软软的，非常舒服。走廊西面通往本派的练功宝地玄冰室。
LONG);
  	set("exits",([
      		"east" : __DIR__"changl10",
      		"west" : __DIR__"xuanbing",
  	]));
        set("objects",([
                CLASS_D("lingjiu") + "/cheng" : 1,
        ]));
  	set("no_clean_up", 0);
  	setup();
  	replace_program(ROOM);
}
