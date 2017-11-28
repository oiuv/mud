inherit ROOM; 
 
void create ()
{
  	set ("short", "正厅");
  	set ("long", @LONG
厅门口挂着一块横匾，上书「威震河朔」四个大字，金光闪闪，好不威风。
几个镖师站立两旁。总镖头的二儿子王剑杰正坐在当中的太师椅上，由于总镖
头王维扬上了年纪，所以现在镖局由王剑杰来管理。看到你进来，他对你点头
笑了笑。也许是因为没有人说话，厅上的气氛很严肃。
LONG);

  	set("exits", ([
  		"east" : __DIR__"dining_room",
  		"west" : __DIR__"pianting",
  		"south" : __DIR__"front_yard2",
  		"north" : __DIR__"c_garden",
	]));

  	set("objects", ([
               CLASS_D("zhenyuan") + "/wangjianjie" : 1,
        ]));

	setup();
        "/clone/board/zhenyuan_b"->foo();
} 

int valid_leave(object me, string dir)
{
        object wang;

        if (dir != "north" &&
            dir != "east" &&
            dir != "west" ||
            ! objectp(wang = present("wang jianjie", this_object())))
                return ::valid_leave(me, dir);

        return wang->permit_pass(me, dir);
}
