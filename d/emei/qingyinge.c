#include <ansi.h>
inherit ROOM;

string look_shibei();

void create()
{
      set("short","清音阁");
      set("long",@LONG
这里是峨嵋山的清音阁。此阁位于牛心岭下，东有白龙江
西有黑龙江，两江之水交汇于清音阁下。江上有拱桥两座，分
夸黑龙白龙二江，这就是双飞桥。两江合流处，有一数米高的
黑褐色巨石傲然挺立，形似牛心，名之为「牛心石」。桥边立
有一石碑(shibei)。由此向西上，左行是黑龙江栈道，右路至
白龙洞，东去中峰寺。
LONG);
      set("outdoors", "emei");
      set("objects", ([
           CLASS_D("emei") + "/xian" : 1,
           __DIR__"npc/girldizi" : 1,
      ]));

      set("item_desc", ([
          "shibei" : (: look_shibei :),
      ]));

      set("exits", ([
          "west"  : __DIR__"bailongdong",
          "east"  : __DIR__"zhongfengsi",
          "south" : __DIR__"heilong1",
      ]));
      setup();
      //replace_program(ROOM);
}

string look_shibei()
{
        return

WHT "\n石碑刻有一诗曰：\n\n"
"          ※※※※※※※※※※※※※※\n"
"          ※                        ※\n"
"　　　　　※　" HIC "杰 然 高 阁 出 清 音" NOR + WHT "  ※\n"
"          ※                        ※\n"
"　　　　　※　" HIC "仿 佛 仙 人 下 抚 琴" NOR + WHT "  ※\n"
"          ※                        ※\n"
"　　　　　※　" HIC "试 向 双 溪 一 倾 耳" NOR + WHT "  ※\n"
"          ※                        ※\n"
"　　　　　※　" HIC "无 情 两 水 漱 牛 心" NOR + WHT "  ※\n"
"          ※                        ※\n"
"          ※※※※※※※※※※※※※※\n\n"
"这就是「峨嵋十景诗」中专咏这「双桥清音」的诗。\n" NOR;
}
