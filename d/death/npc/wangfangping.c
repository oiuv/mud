#include <ansi.h>

inherit NPC;
inherit F_DEALER;

void create() {
    set_name("王方平", ({ "wang fangping", "wang", "fangping" }));
    set("title", HIR "冥府地藏王殿前" NOR);
    set("nickname", WHT "鬼王" NOR);
    set("shen_type", 1);

    set("gender", "男性");
    set("age", 475);
    set("long", "王方平本是山中道士，后在丰都山修炼成仙，御封「鬼王」。\n");

    set_skill("unarmed", 500);
    set_skill("dodge", 500);
    set_skill("force", 500);
    set_skill("parry", 500);
    set_skill("magic", 500);
    set_temp("apply/damage", 2000);
    set_temp("apply/parry", 2000);
    set_temp("apply/dodge", 2000);
    set_temp("apply/attack", 2000);
    set_temp("apply/force", 2000);

    set("combat_exp", 20000000);
    set("attitude", "friendly");
    set("vendor_goods", ({
        "/d/death/obj/weapon1",
        "/d/death/obj/weapon2",
        "/d/death/obj/weapon3",
        "/d/death/obj/weapon4",
        "/d/death/obj/weapon5",
        "/d/items/hammer/qixing_chui1",
        "/d/items/hammer/qixing_chui2",
        "/d/items/hammer/qixing_chui3",
        "/d/items/hammer/poyu_chui",
        "/d/death/obj/weapon10",
        "/d/items/hammer/tianluo_chui",
        "/d/items/hammer/dingyao_chui",
        "/d/death/obj/weapon13",
        "/d/death/obj/weapon14",
        "/d/death/obj/weapon15",
        "/d/death/obj/weapon16",
        "/d/death/obj/weapon17",
        "/d/death/obj/weapon18",
        "/d/death/obj/weapon19",
        "/d/death/obj/weapon20",
        "/d/death/obj/weapon21",
        "/d/death/obj/weapon22",
        "/d/death/obj/weapon23",
        "/d/death/obj/weapon24",
        "/d/death/obj/weapon25",
        "/d/death/obj/weapon26",
        "/d/death/obj/weapon27",
        "/d/death/obj/weapon28",
        "/d/death/obj/weapon29",
        "/d/death/obj/weapon30",
        "/d/death/obj/weapon31",
        "/d/death/obj/weapon32",
        "/d/death/obj/weapon33",
        "/d/death/obj/weapon34",
        "/d/death/obj/weapon35",
        "/d/death/obj/weapon36",
        "/d/death/obj/weapon37",
        "/d/death/obj/weapon38",
        "/d/death/obj/weapon39",
        "/d/items/blade/queyue_ren",
        "/d/items/blade/chanyi_dao",
        "/d/items/blade/qiwang_dao",
        "/d/items/blade/fenghuang_jue",
        "/d/items/blade/yingdao",
        "/d/items/blade/qinglong_ya",
        "/d/items/blade/qingdiao_yuzhuo",
        "/d/items/blade/wugui_ren",
        "/d/items/blade/qisha_ren",
        "/d/items/blade/jinyang_dao",
        "/d/items/blade/bihai_jue",
        "/d/items/blade/qing_tianyu1",
        "/d/items/blade/qing_tianyu2",
        "/d/items/blade/qing_tianyu3",
        "/d/items/blade/xuanjin_zhan1",
        "/d/items/blade/xuanjin_zhan2",
        "/d/items/blade/xuanjin_zhan3",
        "/d/items/blade/qiankun_dao1",
        "/d/items/blade/qiankun_dao2",
        "/d/items/blade/dizang_zhan",
        "/d/items/sword/tianzun_jian",
        "/d/items/sword/xuanyuan_jian",
        "/d/items/sword/cangqiong_jian",
        "/d/items/sword/guilong",
        "/d/items/sword/taia",
        "/d/items/sword/qilinjin1",
        "/d/items/sword/qilinjin2",
        "/d/items/sword/qilinjin3",
        "/d/items/sword/longhuang_jian",
        "/d/items/sword/fenghuang_qin",
        "/d/items/sword/yanyang_chi",
        "/d/items/sword/liangtian_chi",
        "/d/items/sword/panlong_jian",
        "/d/items/sword/qingsha_jian",
        "/d/items/sword/tianyue_jian",
        "/d/items/sword/qiyun_jian",
        "/d/items/sword/gusong_jian",
        "/d/items/sword/wuyang_jian",
        "/d/items/sword/huanglong_jian",
        "/d/items/sword/wugou_jian",
        "/d/items/sword/guxing_jian",
    }));

    setup();
    carry_object("/d/items/cloth/guiwang_pao")->wear();
}

void init() {
    add_action("do_list", "list");
    add_action("do_buy", "buy");
}
