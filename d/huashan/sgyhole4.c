// Room: /d/huashan/sgyhole.c

inherit ROOM;

void create()
{
        set("short", "山洞");
        set("long", @LONG
这是一个毫不起眼的山洞，但是里面的石壁上却画满了五
岳剑派所有已经失传的精妙绝招。花岗岩石壁(wall)上很多小
人，全是用利器刻制，想见当初运力之人内力十分深厚。
LONG );
        set("exits", ([ /* sizeof() == 4 */
            "south"   : __DIR__"sgyhole3"

        ]));
        set("item_desc", ([ 
            "wall" : @TEXT

       o    | o      o    \ o      o      o     <o     <o>
    --^|\    ^|^  --v|^    v|v    |/v   \|X|    \|      |
       /\     >\    /<      >\    /<      >\    /<      >\

       o>     o      o      o      o      o      o      o
       \ __   x     </     <|>    </>    <\>    <)>     |\__
      /<      >\    /<      >\    /<      >\     >>     L
TEXT
        ]));

        setup();
}
void init()
{
        add_action("do_mianbi", "mianbi");
}

int do_mianbi()
{
        object ob;
        int c_skill, add;

        ob = this_player();

        c_skill = (int)ob->query_skill("sword", 1);
        if (ob->query_skill("sword", 1) < 100)
        {
                write("你对基本剑法的了解显然太低，无法领悟石壁内容。\n", ob);
                return 1; 
        }

        if (! ob->can_improve_skill("sword"))
        {
                write("你的实战经验不足，无法领悟石壁内容。\n");
                return 1; 
        }

        if (ob->query("jing") < 40)
        {
                write("你精力不能集中，现在无法领悟石壁内容。\n");
                return 1; 
        }

        if (c_skill > 150)
        {
                write("你觉得石壁内容太肤浅了。\n");
                return 1;
        }

        message_vision("$N面对着石壁趺坐静思，良久，对「基本剑法」"
                        "似有所悟。\n", ob);
        if ( ob->query( "special_skill/clever" ) )
                add = ob->query("int") * 2;
        else
                add = ob->query("int");
        ob->improve_skill("sword", 1 + random(add));
        ob->receive_damage("jing", 35);
        ob->start_busy(2);
        return 1;
}
