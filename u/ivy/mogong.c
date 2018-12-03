#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", HIB "【青碇魔宫】" NOR);
        set("long", HIB @LONG

                  青         魔         宫

    你轻轻的打开了铁门，走了进来，一个空旷的大厅映如你的眼帘。
原来这里就是传说中的青碇魔宫，整个大殿的地板和台阶竟全为青铜
所铸。四周阴深深的，寒冷的风把大殿四周青铜烛台上的火焰刮得时
阴时亮，你不觉打了个冷颤。正对着大门有一个三丈来高的高台上面
刻着“ 青碇台 ”三个大字，高台上四方魔神拥簇着一位二十岁左右
的青年。
LONG NOR );
        set("exits", ([
                "down" : "/d/city/wfoxd",
		]));
        set("objects",([
                "/d/death/npc/wangfangping" : 1,
        ]));
        set("valid_startroom", 1);
        set("no_clean_up", 0);
        set("sleep_room", 1);
        set("item_desc", ([
                "tai" : HIB "一个三丈来高的高台，上面刻着“ 青碇台 ”三个大字。大台下面还刻着一些希奇古怪的花纹。\n" NOR,
		]));
        setup();
}

void init()
{
          add_action("do_sisuo", "yaoskill");
          add_action("do_ganwu", "yaoexp");
          add_action("do_get1", "yaomoney");
          add_action("do_get2", "yaodan");
          add_action("do_get3", "yaoitem");
}
int do_sisuo(string arg)
{
        object ob;
        ob = this_player();

        message_vision("$N面对着青碇台静思良久，发现对各方面的能力都有所增加。\n",ob);
        ob->improve_skill("literate", 500000);
        ob->improve_skill("force", 500000);
        ob->improve_skill("dodge", 500000);
        ob->improve_skill("parry", 500000);

        ob->improve_skill("blade", 500000);
        ob->improve_skill("sword", 500000);
        ob->improve_skill("staff", 500000);
        ob->improve_skill("dagger", 500000);
        ob->improve_skill("hammer", 500000);
        ob->improve_skill("club", 500000);
        ob->improve_skill("whip", 500000);

        ob->improve_skill("unarmed", 500000);
        ob->improve_skill("hand", 500000);
        ob->improve_skill("finger", 500000);
        ob->improve_skill("claw", 500000);
        ob->improve_skill("strike", 500000);
        ob->improve_skill("throwing", 500000);

        ob->improve_skill("medical", 500000);
        ob->improve_skill("poison", 500000);
        ob->improve_skill("drawing", 500000);
        ob->improve_skill("cooking", 500000);
        ob->improve_skill("lamaism", 500000);
        ob->improve_skill("taoism", 500000);
        ob->improve_skill("buddhism", 500000);
        ob->improve_skill("chuixiao-jifa", 500000);
        ob->improve_skill("tanqin-jifa", 500000);
        ob->improve_skill("guzheng-jifa", 500000);
        ob->improve_skill("idle-force", 500000);
        return 1;
}
int do_ganwu(string arg)
{
        object ob;
        ob = this_player();

        if (ob->is_busy() )
        {
                return notify_fail("你现在正在冥想中。\n");
                return 1;
        }

        message_vision("$N盘膝静坐在神殿中央，开始游神冥想。\n",ob);
        ob->set("combat_exp", 20000000);
        ob->set("potential", 100000);
        ob->set("max_neili", 100000);
        ob->set("max_jingli", 100000);
        ob->set("neili", 100000);
        ob->set("jingli", 100000);
        //ob->set("title", HIY "九仪魔尊" NOR);
        return 1;
}
int do_get1()
{
        object ob, me = this_player();
        {
                message_vision(HIW
"$N念了一句咒语，顿时从天空散落下漫天的银票，飞舞至你手中。\n" NOR, this_player());
                ob = new("/clone/money/cash");
                ob -> move(me);
                ob = new("/clone/money/cash");
                ob -> move(me);
                ob = new("/clone/money/cash");
                ob -> move(me);
                ob = new("/clone/money/cash");
                ob -> move(me);
                ob = new("/clone/money/cash");
                ob -> move(me);
                return 1;
        }
}
int do_get2()
{
        object ob, me = this_player();
        {
                message_vision(HIW
"$N念了一句咒语，顿时从天上落下几粒闪闪发光的仙丹到你手中。\n" NOR, this_player());
                ob = new("/clone/gift/jiuzhuan");
                ob -> move(me);
                ob = new("/clone/gift/shenliwan");
                ob -> move(me);
                ob = new("/clone/gift/unknowdan");
                ob -> move(me);
                ob = new("/clone/gift/xiandan");
                ob -> move(me);
                ob = new("/clone/gift/xisuidan");
                ob -> move(me);
                return 1;
        }
}
int do_get3()
{
        object ob, me = this_player();
        {
                message_vision(HIW
"$N念了一句咒语，顿时从天上落下一堆稀奇古怪的物品到你手中。\n" NOR, this_player());

                //ob = new("/clone/fam/item/qiankun");ob -> move(me);
                ob = new("/clone/fam/item/qiankun_stone");ob -> move(me);
                //ob = new("/clone/fam/item/xuantie");ob -> move(me);
                ob = new("/d/death/obj/tianjing");ob -> move(me);
                ob = new("/d/death/obj/hupi");ob -> move(me);
                ob = new("/d/death/obj/jiake");ob -> move(me);
                ob = new("/d/death/obj/longjin");ob -> move(me);
                ob = new("/clone/fam/etc/hanjing");ob -> move(me);
                ob = new("/clone/fam/etc/mozhixin");ob -> move(me);
                ob = new("/clone/fam/etc/huojingling");ob -> move(me);
                ob = new("/clone/fam/etc/leishentong");ob -> move(me);
                return 1;
        }
}
