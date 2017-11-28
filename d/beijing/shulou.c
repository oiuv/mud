inherit ROOM;

void create ()
{
  	set ("short", "书楼");
  	set ("long", @LONG
此处风景优美，让人如痴如醉。除了一张竹床和几张竹桌竹椅之外，屋子
里就只有几个大书架了。仔细看看，书架上除了兵法、武功的书，琴棋书画之
类的书籍也不少。有空时，王维扬的两个儿子王剑英，王剑杰会上这里来读书，
做诗，赏画，当然欣赏风景，饮酒作乐也是少不了的。一阵微风吹来，使人不
禁心旷神怡，诗兴大发。
LONG);

  	set("exits", ([
  		"down" : __DIR__"rain",
	]));

  	setup();
        replace_program(ROOM);
}
