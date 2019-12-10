// qi.c 戚长发

#include <ansi.h>
#include <command.h>

inherit NPC;
inherit F_DEALER;

int do_answer();

void create()
{
	set_name("戚长发", ({ "qi changfa","changfa", "qi" }));
	set("title", HIB"奇货商人"NOR);
  set("nickname", HIR "宰人不用刀，" HIC "愿" HIR "者上钩" NOR);
	set("gender", "男性");
	set("age", 48);
	set("str", 100);
	set("long",
		"戚老板最近暴发横财，所谓是三年不开张，开张管三年。\n");
	set_skill("unarmed", 50);
	set_skill("dodge", 50);
	set_skill("higgling", 500);
	set_temp("apply/damage", 15);

	set("combat_exp", 800000);
	set("attitude", "friendly");

        set("inquiry", ([
                "宝物" : (: do_answer :),
                "还我" : "哼！我这里是有进无出！",
                "我的钱" : "什么你的钱，地上的就是我的！",
                "马哨" : "我这的马哨可要比镇远镖局的质量更好哦。",
                "东西" : "扔掉就没了！嘿嘿。",
		            "天王保命丹" : "卖！卖！二百两黄金一粒！",
		            "翡翠兰" : "可治百毒啊！有气就能活！",
		            "朱睛冰蟾" : "虽然不象翡翠兰那样可起死回生，但是能解百毒！",
        ]));
//售价100gold以上的五折 2017-02-20
	set("vendor_goods", ([
		"/d/shenlong/obj/hua4"    : 2000000,
		"/clone/misc/zhujingchan" : 500000,
		"/clone/fam/gift/str2"    : 5000000,
		"/clone/fam/gift/int2"    : 5000000,
		"/clone/fam/gift/con2"    : 5000000,
		"/clone/fam/gift/dex2"    : 5000000,
    "/clone/fam/gift/kardan"  : 1000000,
    "/clone/fam/gift/perwan"  : 1000000,
    "/clone/medicine/baoming" : 1000000,
    	//售价100gold以下的不变
    "/clone/book/tianmo_book" : 200000,
    "/clone/book/zhengqi_book": 200000,
    "/clone/weapon/goldbow3": 200000,
		"/clone/misc/whistle": 200000,
	]));

	setup();
	set_max_encumbrance(100000000);
}

void init()
{
        add_action("do_buy", "buy");
	add_action("do_list", "list");
        add_action("do_drop", "drop");
        //add_action("do_look", ({"guankan", "kan"}));
}

int do_drop(string arg)
{
        int i;
        object *ob;

        if (! arg)
                return 0;

        if (! DROP_CMD->main(this_player(), arg))
                return 0;

        if (! GET_CMD->main(this_object(), arg))
                return 1;

        ob = all_inventory(this_object());
        for (i = 0; i < sizeof(ob); i++)
                if (! ob[i]->is_character()) destruct(ob[i]);
        if (! random(5))
        {
                switch (random(4))
                {
                case 0:
                        command("say 日积月累，小康之路！");
                        break;
                case 1:
                        command("kok " + this_player()->query("id"));
                        command("say 随地乱扔垃圾，罚款五元！");
                        break;
                case 2:
                        command("say 败家子，败家子！");
                        break;
                default:
                        command("heihei");
                        break;
                }
        }
        return 1;
}

int do_answer()
{
        write(name() + "在你耳边轻声说道：我");
        ::do_list();
        write("这可真是货真价实，童叟无欺啊！\n");
        return 1;
}

int accept_object(object who, object ob)
{
        switch(random(6))
        {
        case 0:
                command("say 好！好！");
                break;
        case 1:
                command("say 不要就给我！");
                break;
        }
        if (! ob->is_character())
        {
                destruct(ob);
                return -1;
        }

        return 1;
}

void recover()
{
        mapping p;

        clear_condition(0);
        p = query_entire_dbase();
        p["eff_qi"] = p["max_qi"];
        p["qi" ] = p["max_qi"];
        p["eff_jing"] = p["max_jing"];
        p["jing" ] = p["max_jing"];
}
/*
int recognize_apprentice(object me, string skill)
{
        if (skill == "higgling")
                return 1;
        else
                return 0;
}
*/
void unconcious()
{
        message_vision("\n$N哼哼两声，道：“困死了...哦！”\n",
                       this_object());
        recover();
}

void die()
{
        message_vision("\n$N大叫一声，道：“痛死啦！”连忙掏出天王保命丹吃了两颗。\n",
                       this_object());
        recover();
}
