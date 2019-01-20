#include <ansi.h>;
inherit ROOM;

void create()
{
  	set("short", "成德殿");
  	set("long",
"这就是日月神教教主平日发号施令的地方，殿中无窗，殿
口点着明晃晃的蜡烛，大殿彼端高设一座，座中坐着一个白发
老者，自是名震江湖的日月神教教主任我行了。高座正上方立
有一块大匾，写着三个金光耀眼的大字：

           " HIW "※※※※※※※※※※※※※※※※
           ※                            ※
           ※" NOR + HIR "     成      德      殿" NOR + HIW "     ※
           ※                            ※
           ※※※※※※※※※※※※※※※※" NOR "

殿内四周站满了日月神教的弟子和侍从，正在倾听教主宝训。\n
");
  	set("valid_startroom", 1);
  	set("exits",([
      		"north" : __DIR__"zoulang",
      		"south" : __DIR__"shanya1",
  	]));
        set("objects", ([
                CLASS_D("riyue") + "/ren" : 1,
      		__DIR__"npc/dizi" : 4,
        ]));
  	setup();
  	"/clone/board/riyue_b"->foo();
}

int valid_leave(object me, string dir)
{
//      int i;
//      object ob;
        me = this_player();

        if (dir != "south")
        {
                if ((string)me->query("family/family_name") != "日月神教"
                & objectp(present("ren woxing", environment(me))))
                        return notify_fail(CYN "任我行喝道：阁下未免太过放肆，在"
                                           "老夫面前也敢这般横行！\n" NOR);
        }
        return ::valid_leave(me, dir);
}