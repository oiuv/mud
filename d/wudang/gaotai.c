#include <ansi.h>
inherit ROOM;

void create()
{
      	set("short", "南岩宫高台");
      	set("long", @LONG
这里是就是南岩宫高台。高台孤悬崖侧，四望临渊，深不
可测。山风夹耳，松清涤面，顿觉心窍大开。武当真武剑阵就
在这里。真武剑阵由五名五行弟子按东西南北中木金、火、水、
土方位，八名八卦弟子按乾、坤、坎、离、巽、震、艮、兑八
方天、地、水、火、风、雷、山、泽排列。
LONG);
      	set("objects", ([
           	CLASS_D("wudang") +"/wuxing": 5,
           	CLASS_D("wudang") +"/bagua": 8,
           	CLASS_D("wudang") +"/yan": 1,
      	]));
      	set("exits",([
          	"northdown" : __DIR__"nanyangong",
      	]));
      	set("outdoors", "wudang");
      	setup();
      	replace_program(ROOM);
}
