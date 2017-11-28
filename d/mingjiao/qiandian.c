//room: /d/mingjiao/qiandian.c
inherit ROOM;

void init();

void create()
{
        set("short","明教前殿");
        set("long", @LONG
你来到这里，放眼窗外望去，漫漫昆仑雪山，晶莹剔透，苍
天浩浩，白云悠悠。东方沃野千里，楚天辽阔；西面高山巍巍，
迤逦万里。这里就是叱咤武林八百年的明教总舵的前殿。
LONG);
       set("exits",([
           "east"      : __DIR__"eastdian",
           "west"      : __DIR__"westdian",
           "north"     : __DIR__"dadian",
           "southdown" : __DIR__"square",
       ]));
       setup();
       replace_program(ROOM);
}

