
export interface QAEntry {
    keywords: string[];
    response: string;
    reference: string;
}

export const knowledgeBase: QAEntry[] = [
    {
        keywords: ["urge to action", "urge", "action"],
        response: "Nehru describes the 'urge to action' as a vital force springing from the depths of his being. It is not action divorced from thought, but flowing from it. He writes: 'The call of action has long been with me; not action divorced from thought, but rather flowing from it in one continuous sequence.'",
        reference: "The Discovery of India, Chapter 1"
    },
    {
        keywords: ["ahmednagar fort", "fort"],
        response: "Nehru spent over twenty months in Ahmednagar Fort during his ninth imprisonment. He describes it as a place where 'the new moon, a shimmering crescent in the darkening sky, greeted us on our arrival.'",
        reference: "The Discovery of India, Chapter 1"
    },
    {
        keywords: ["moon", "companion"],
        response: "For Nehru in prison, the moon was a constant companion. He wrote: 'The moon, ever a companion to me in prison, has grown more friendly with closer acquaintance, a reminder of the loveliness of this world.'",
        reference: "The Discovery of India, Chapter 1"
    },
    {
        keywords: ["spirit of india", "india's spirit", "bharat mata"],
        response: "Nehru often reflected on the 'Spirit of India'—a continuity of culture that has survived through ages. He saw India not just as a geography but as a living entity with a deep soul that persisted despite invasions and decline.",
        reference: "The Discovery of India"
    },
    {
        keywords: ["scientific temper", "science"],
        response: "Nehru was a strong advocate of the 'scientific temper'. He believed that the scientific approach—based on observation, reason, and experiment—should be applied to life's problems, replacing superstition and dogma.",
        reference: "The Discovery of India"
    },
    {
        keywords: ["unity in diversity", "diversity"],
        response: "One of the central themes of the book is 'Unity in Diversity'. Nehru observed that despite India's vast linguistic, cultural, and religious differences, there is a deep underlying unity that binds the people together.",
        reference: "The Discovery of India"
    },
    {
        keywords: ["religion", "faith"],
        response: "Nehru had a complex view of religion. While he was not attracted to organized religion's dogmas and rituals, he acknowledged its role in providing ethical values. He preferred a spiritual approach based on ethics and humanism rather than supernatural beliefs.",
        reference: "The Discovery of India"
    },
    {
        keywords: ["gandhi", "mahatma"],
        response: "Nehru writes extensively about Gandhi's influence, describing him as a 'beam of light' that pierced the darkness. He admired Gandhi's emphasis on truth and non-violence, which transformed the Indian National Congress.",
        reference: "The Discovery of India"
    }
];

export const fallbackResponse = {
    response: "I'm delving through the pages of history to find that answer, but I haven't found a direct reference in my current notes. You might try asking about 'The Urge to Action', 'Ahmednagar Fort', or 'The Spirit of India'.",
    reference: "System Guide"
};
