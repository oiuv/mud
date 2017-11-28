// sanhua-zhang.c É¢»¨ÕÆ

inherit SHAOLIN_SKILL;

mapping *action = ({
([      "action": "$NºÏÕÆ±§Çò£¬Ò»Ê½¡¸´ºÉî·¼²Ý¾¡¡¹£¬Ë«ÕÆ±ä»ÃÍÌÍÂ£¬»º»ºÍÆÏò$nµÄ$l",
        "force" : 350,
        "attack": 69,
        "dodge" : 75,
        "parry" : 50,
        "damage": 25,
        "skill_name" : "´ºÉî·¼²Ý¾¡",
        "damage_type" : "ðöÉË"
]),
([      "action": "$NÎåÖ¸ÕÀ¿ª£¬Ò»Ê½¡¸ÏÄÏÐ¶ÀÀ¼Ü°¡¹£¬×óÓÒÕÆ´©²å·­·É£¬¼²Ïò$nµÄ$lÅÄÈ¥",
        "force" : 360,
        "attack": 72,
        "dodge" : 60,
        "parry" : 65,
        "damage": 20,
        "skill_name" : "ÏÄÏÐ¶ÀÀ¼Ü°",
        "damage_type" : "ðöÉË"
]),
([      "action": "$NÊ¹Ò»Ê½¡¸Çïº¨¾ÕËªÇå¡¹£¬×óÕÆÐéÍÐ£¬ÓÒÕÆÕ§ÉìÕ§ºÏ£¬ÃÍµØ²åÍù$nµÄ$l",
        "force" : 340,
        "attack": 79,
        "dodge" : 55,
        "parry" : 70,
        "damage": 32,
        "skill_name" : "Çïº¨¾ÕËªÇå",
        "damage_type" : "ðöÉË"
]),
([      "action": "$NË«ÕÆÑªºì£¬Ò»Ê½¡¸¶¬ÎÔÌýÃ·Ò÷¡¹£¬»Ã³ÉÂþÌìÃ·»¨¶ä¶ä£¬Óêµã°ãÏò$n»÷È¥",
        "force" : 370,
        "attack": 67,
        "dodge" : 50,
        "parry" : 60,
        "damage": 35,
        "skill_name" : "¶¬ÎÔÌýÃ·Ò÷",
        "damage_type" : "ðöÉË"
])
});

int valid_enable(string usage) { return usage == "strike" || usage == "parry"; }

int valid_combine(string combo) { return combo == "nianhua-zhi"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("Á·É¢»¨ÕÆ±ØÐë¿ÕÊÖ¡£\n");

        if ((int)me->query_skill("force", 1) < 60)
                return notify_fail("ÄãµÄÄÚ¹¦»ðºò²»¹»£¬ÎÞ·¨Ñ§É¢»¨ÕÆ¡£\n");

        if ((int)me->query("max_neili") < 300)
                return notify_fail("ÄãµÄÄÚÁ¦Ì«Èõ£¬ÎÞ·¨Á·É¢»¨ÕÆ¡£\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("sanhua-zhang", 1))
                return notify_fail("ÄãµÄ»ù±¾ÕÆ·¨»ðºòË®Æ½ÓÐÏÞ£¬ÎÞ·¨Áì»á¸ü¸ßÉîµÄÉ¢»¨ÕÆ¡£\n");

        return 1;
}

string query_skill_name(int level)
{
        return action[random(sizeof(action))]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        return action[random(sizeof(action))];
}

int practice_skill(object me)
{
        if (me->query_temp("weapon") ||
            me->query_temp("secondary_weapon"))
                return notify_fail("Äã±ØÐë¿ÕÊÖÁ·Ï°£¡\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("ÄãµÄÌåÁ¦Ì«µÍÁË¡£\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("ÄãµÄÄÚÁ¦²»¹»Á·É¢»¨ÕÆ¡£\n");

        me->receive_damage("qi", 65);
        me->add("neili", -66);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"sanhua-zhang/" + action;
}
