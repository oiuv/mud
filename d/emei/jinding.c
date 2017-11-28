inherit ROOM;

void create()
{
      	set("short", "金顶");
      	set("long", @LONG
这就是峨嵋山的主峰金顶。此峰耸立大地，高入云表，秀
丽而又壮美，李白赞颂它：『青冥倚天开，彩错疑画出』登上
金顶，视野豁然开朗，鸟看脚下，但见群峰涌绿叠翠，三江如
丝如带；回首远眺，则见大雪山横亘天际，贡嘎山直插苍穹。
LONG);
        set("no_sleep_room",1);
      	set("outdoors", "emei");

      	set("objects", ([
           	CLASS_D("emei") + "/fengling" : 1,
      	]));
      	set("exits",([
          	"northdown" : __DIR__"wanxingan",
          	"southwest" : __DIR__"woyunan", 
          	"southeast" : __DIR__"huacangan",
      	]));

      	set("no_clean_up", 0);
      	setup();
      	replace_program(ROOM);
}
