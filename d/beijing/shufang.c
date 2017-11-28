inherit ROOM;

void create ()
{
  set ("short", "书房");
  set ("long", @LONG
踏进门来，第一眼就看见墙上的一幅淡黄卷轴，上书十四个大字：“古来
青史谁不见，今见功名胜古人。”四周的书架上摆满了各式各样的书籍，春秋
战国，诸子百家，无一不有。书桌后面放着一架大理石屏风，转过去只见窗口
放着张小小木榻，往下望去，柳条垂金，群芳争艳。
LONG);

  	set("exits", ([
  		"out" : __DIR__"cabinet2",
	]));

  	set("objects", ([
                CLASS_D("zhenyuan") + "/wangweiyang" : 1,
       ]));

  	setup();
        replace_program(ROOM);
}
